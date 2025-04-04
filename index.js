const fs = require("fs");
const pdfParse = require("pdf-parse");
const ExcelJS = require("exceljs");

async function extractTablesFromPDF(pdfPath, outputExcel) {
    const dataBuffer = fs.readFileSync(pdfPath);
    const pdfData = await pdfParse(dataBuffer);
    const text = pdfData.text;
    
    // Split text by lines
    const lines = text.split("\n");
    
    // Identify table structure based on spacing (basic heuristic approach)
    const tables = [];
    let currentTable = [];
    
    lines.forEach(line => {
        const columns = line.split(/\s{2,}/); // Assume tables have multiple spaces between columns
        if (columns.length > 1) {
            currentTable.push(columns);
        } else if (currentTable.length > 0) {
            tables.push(currentTable);
            currentTable = [];
        }
    });
    if (currentTable.length > 0) tables.push(currentTable);
    
    // Write to Excel
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Extracted Tables");
    
    tables.forEach((table, tableIndex) => {
        worksheet.addRow([`Table ${tableIndex + 1}`]);
        table.forEach(row => worksheet.addRow(row));
        worksheet.addRow([]); // Add an empty row for separation
    });
    
    await workbook.xlsx.writeFile(outputExcel);
    console.log(`Tables extracted and saved to ${outputExcel}`);
}

// Usage example
const pdfPath = "sample.pdf";
const outputExcel = "extracted_tables.xlsx";
extractTablesFromPDF(pdfPath, outputExcel).catch(console.error);
