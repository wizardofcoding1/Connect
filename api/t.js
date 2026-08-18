import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl || "", supabaseAnonKey || "");

export default async function handler(req, res) {
  // Support CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // Get parameters from Vercel query routing (mapped in vercel.json)
  const { code, ext } = req.query;

  if (!code) {
    return res.status(400).send("Bad Request: Missing note code parameter.");
  }

  // The storage file path
  const storagePath = `shares/${code.toUpperCase()}.txt`;
  
  // Public URL to retrieve the text file
  const publicFileUrl = `${supabaseUrl}/storage/v1/object/public/documents/${storagePath}`;

  try {
    const response = await fetch(publicFileUrl);
    if (!response.ok) {
      return res.status(404).send("Share link not found or has been deleted.");
    }

    const text = await response.text();

    // Check expiration header
    const expireMatch = text.match(/^CONNECT_SHARE_EXPIRE: ([^\n\r]+)/);
    if (expireMatch) {
      const expireTime = new Date(expireMatch[1]);
      if (new Date() > expireTime) {
        // Expired! Remove the storage file asynchronously
        try {
          await supabase.storage.from("documents").remove([storagePath]);
        } catch (e) {
          console.error("Error deleting expired share file:", e);
        }
        return res.status(410).send("This share link has expired (validation limit: 7 days).");
      }

      // Valid note! Strip expiration header line and leading spaces
      const headerLength = expireMatch[0].length;
      let rawContent = text.slice(headerLength).replace(/^[\r\n]+/, "");

      // Handle formatting
      const requestedFormat = (ext || "txt").toLowerCase();
      const sanitizedTitle = `Note_${code.toUpperCase()}`;

      if (requestedFormat === "txt") {
        res.setHeader("Content-Type", "text/plain; charset=utf-8");
        res.setHeader("Content-Disposition", `attachment; filename="${sanitizedTitle}.txt"`);
        return res.status(200).send(rawContent);
      }

      if (requestedFormat === "md") {
        const mdContent = `# ${sanitizedTitle.replace(/_/g, " ")}\n\n${rawContent}`;
        res.setHeader("Content-Type", "text/markdown; charset=utf-8");
        res.setHeader("Content-Disposition", `attachment; filename="${sanitizedTitle}.md"`);
        return res.status(200).send(mdContent);
      }

      if (requestedFormat === "docx") {
        const htmlContent = `
          <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
          <head>
            <title>${sanitizedTitle}</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 40px; color: #1e293b; line-height: 1.6; }
              h1 { color: #1e3a8a; font-size: 24px; border-bottom: 1px solid #cbd5e1; padding-bottom: 8px; margin-bottom: 16px; }
              p { font-size: 14px; white-space: pre-wrap; }
            </style>
          </head>
          <body>
            <h1>${sanitizedTitle.replace(/_/g, " ")}</h1>
            <p>${rawContent.replace(/\n/g, "<br/>")}</p>
          </body>
          </html>
        `;
        res.setHeader("Content-Type", "application/msword; charset=utf-8");
        res.setHeader("Content-Disposition", `attachment; filename="${sanitizedTitle}.docx"`);
        return res.status(200).send(htmlContent);
      }

      if (requestedFormat === "xlsx" || requestedFormat === "xls") {
        const rows = rawContent.split("\n");
        const tableRows = rows.map((row) => `<tr><td>${row}</td></tr>`).join("");
        const excelContent = `
          <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:x='urn:schemas-microsoft-com:office:excel' xmlns='http://www.w3.org/TR/REC-html40'>
          <head>
            <!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>${sanitizedTitle.slice(0, 30)}</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]-->
          </head>
          <body>
            <table>
              <thead>
                <tr><th style="font-weight:bold;background-color:#cbd5e1;text-align:left;">${sanitizedTitle.replace(/_/g, " ")}</th></tr>
              </thead>
              <tbody>
                ${tableRows}
              </tbody>
            </table>
          </body>
          </html>
        `;
        res.setHeader("Content-Type", "application/vnd.ms-excel; charset=utf-8");
        res.setHeader("Content-Disposition", `attachment; filename="${sanitizedTitle}.xlsx"`);
        return res.status(200).send(excelContent);
      }

      if (requestedFormat === "pdf") {
        const pdfHtml = `
          <html>
            <head>
              <title>${sanitizedTitle}</title>
              <style>
                body { font-family: system-ui, -apple-system, sans-serif; padding: 40px; color: #1e293b; line-height: 1.7; }
                h1 { color: #1d4ed8; font-size: 28px; border-bottom: 2px solid #e2e8f0; padding-bottom: 12px; margin-bottom: 24px; }
                p { white-space: pre-wrap; font-size: 14px; }
              </style>
            </head>
            <body>
              <h1>${sanitizedTitle.replace(/_/g, " ")}</h1>
              <p>${rawContent}</p>
            </body>
          </html>
        `;
        res.setHeader("Content-Type", "text/html; charset=utf-8");
        res.setHeader("Content-Disposition", `attachment; filename="${sanitizedTitle}.pdf"`);
        return res.status(200).send(pdfHtml);
      }

      // Default fallback
      res.setHeader("Content-Type", "text/plain; charset=utf-8");
      return res.status(200).send(rawContent);
    }

    // Default if no header is present
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    return res.status(200).send(text);
  } catch (error) {
    return res.status(500).send(`Server Error: ${error.message}`);
  }
}
