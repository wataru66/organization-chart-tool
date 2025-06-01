# Organization Chart Tool (Call Name Version)

A powerful web-based application for automatically generating interactive organization charts from Excel files. This tool supports custom styling, drag & drop editing, multiple export formats, and advanced features like fullscreen display and data validation.

## 🚀 Features

### Core Functionality
- **Excel File Import**: Support for .xlsx and .xls files with drag & drop interface
- **Interactive Chart Generation**: Automatically create visual organization charts with hierarchical layouts
- **Real-time Data Editing**: Edit organization data directly in the browser with validation
- **Multi-format Export**: SVG, PNG, HTML, and Excel export capabilities

### Advanced Features
- **Custom Color System**: 15-color palette with department presets and custom color support
- **Manager Visibility Toggle**: Option to hide/show managers in the chart display
- **Drag & Drop Row Reordering**: Rearrange data table rows with intuitive drag & drop
- **Fullscreen Display**: Full-screen mode for better chart visualization
- **Data Validation**: Comprehensive data validation with detailed error reporting
- **Empty Template Export**: Generate Excel templates with proper formatting

### UI/UX Features
- **English Interface**: Fully internationalized with English as the default language
- **Responsive Design**: Works on desktop and mobile devices
- **Keyboard Shortcuts**: Ctrl+G (Generate), Ctrl+S (Export SVG), Ctrl+P (Print)
- **Real-time Feedback**: Success/error notifications with detailed information

## 📋 System Requirements

### Browser Support
- **Chrome**: Version 90 or later (recommended)
- **Firefox**: Version 88 or later
- **Edge**: Version 90 or later
- **Safari**: Version 14 or later

### Required Libraries
- **SheetJS (XLSX)**: For Excel file processing (automatically loaded via CDN)
- **html2canvas**: For PNG export functionality (automatically loaded via CDN)

## 🛠️ Installation

### Option 1: Direct Use (Recommended)
1. Clone or download the repository
2. Open `src/index.html` in a modern web browser
3. The application will automatically load all required dependencies

### Option 2: Local Web Server
```bash
# Using Python
python -m http.server 8000

# Using Node.js
npx http-server

# Using PHP
php -S localhost:8000
```

Navigate to `http://localhost:8000/src/`

## 📊 Excel File Format

### Required Columns
The Excel file must contain the following columns (in order):

| Column | Name | Type | Description |
|--------|------|------|-------------|
| A | Level | Number | Hierarchy level (1-10) |
| B | Employee ID | Text | Employee identifier (optional) |
| C | Name | Text | **Required** - Person's name |
| D | Name (EN) | Text | English name (optional) |
| E | Grade | Text | Job grade/level (optional) |
| F | Team Long Name | Text | Full organization name |
| G | Call Name | Text | **Required** - Short organization identifier |
| H | Concurrent | Text | Concurrent positions (optional) |
| I | Parent Org | Text | Parent organization's Call Name |
| J | Role | Text | **Required** - Job role/position |
| K | Role (JP) | Text | Japanese role name (optional) |
| L | Border Color | Text | Custom border color (optional) |
| M | Background Color | Text | Custom background color (optional) |
| N | Header Text Color | Text | Custom header text color (optional) |

### Example Data Structure
```
Level | Employee ID | Name      | Name (EN)  | Grade | Team Long Name        | Call Name | Parent Org | Role              | Role (JP)
1     |            | John Doe   | John Doe   | M4    | Head Office          | HQ        | N/A        | President         | 社長
2     |            | Jane Smith | Jane Smith | M3    | Production Dept      | PROD      | HQ         | Department Manager| 部長
3     |            | Bob Wilson | Bob Wilson | M2    | Manufacturing        | MFG       | PROD       | Section Manager   | 課長
```

### Color System
Colors can be specified using:
- **Palette Colors**: `blue-light`, `green-medium`, `red-dark`, etc.
- **HEX Values**: `#2196f3`, `#4caf50`, etc.
- **Color Names**: `red`, `blue`, `green`, etc.
- **Department Presets**: `direct`, `indirect`, `management`, `sales`, `support`

## 🎯 Usage Guide

### Basic Workflow
1. **Load Data**
   - Click "Drop Excel file here" or drag & drop an Excel file
   - Or click "Load Sample Data" to try with sample data

2. **Configure Display**
   - Select base organization (optional)
   - Set level limit for hierarchy depth
   - Choose font size and box size
   - Toggle manager visibility if needed

3. **Generate Chart**
   - Click "Generate Chart" to create the visualization
   - The chart will display with hierarchical layout

4. **Export & Share**
   - Use export buttons for SVG, PNG, HTML, or Excel formats
   - Use "Full Screen" for better viewing experience
   - Print directly from the browser

### Advanced Features

#### Data Table Editing
1. Click "Show/Edit Data Table" to open the editor
2. Add new rows with "Add New Row"
3. Delete rows using the delete button in each row
4. Drag rows by the handle (⋮) to reorder
5. Click "Apply Changes" to save modifications

#### Color Customization
1. In the data table, click on color cells to open the color picker
2. Choose from department presets or the 15-color palette
3. Enter custom HEX colors for specific styling
4. Colors are preserved in all export formats

#### Data Validation
1. Click "Validate Data" to check for errors
2. View detailed validation results with statistics
3. Fix any reported issues in the data table
4. Re-validate to ensure data integrity

## 🎨 Customization

### Color Palette
The tool includes a 15-color palette organized by hue and intensity:
- **Blue**: `blue-light`, `blue-medium`, `blue-dark`
- **Green**: `green-light`, `green-medium`, `green-dark`
- **Purple**: `purple-light`, `purple-medium`, `purple-dark`
- **Orange**: `orange-light`, `orange-medium`, `orange-dark`
- **Red**: `red-light`, `red-medium`, `red-dark`

### Department Presets
Pre-configured color schemes for common department types:
- **Direct**: Blue theme for production departments
- **Indirect**: Green theme for support functions
- **Management**: Purple theme for executive roles
- **Sales**: Orange theme for sales organizations
- **Support**: Red theme for administrative functions

## 📤 Export Formats

### SVG Export
- Vector format for scalable graphics
- Preserves all styling and colors
- Ideal for print and high-resolution displays

### PNG Export
- Raster format with 2x scaling for high quality
- Requires html2canvas library (auto-loaded)
- Best for presentations and documents

### HTML Export
- Standalone HTML file with embedded CSS
- Includes all legends and styling
- Perfect for sharing and web publishing

### Excel Export
- **Empty Template**: Download a properly formatted template
- **Current Data**: Export current data with all modifications
- Preserves all color customizations

## 🔧 Configuration

### Debug Mode
Add `?debug=true` to the URL to enable debug logging:
```
http://localhost:8000/src/index.html?debug=true
```

### Demo Mode
Add `?demo=true` to automatically load sample data:
```
http://localhost:8000/src/index.html?demo=true
```

## 🐛 Troubleshooting

### Common Issues

#### "PNG export requires html2canvas library"
- The PNG export functionality requires html2canvas
- Use SVG export as an alternative
- Check browser console for loading errors

#### "File format not supported"
- Ensure the file has .xlsx or .xls extension
- Verify the file is a valid Excel format
- Try re-saving the file in Excel

#### "No data loaded"
- Check that required columns are present
- Verify that Name, Call Name, and Role columns contain data
- Use the data validation feature to identify issues

#### Drag & Drop Not Working
- Ensure you're dragging by the handle (⋮) icon
- Check that the data table is in edit mode
- Refresh the page if the feature becomes unresponsive

### Data Validation Errors

#### "Name is required"
- Fill in the Name column for all rows
- Remove empty rows or add names

#### "Call Name is required"
- Each organization must have a unique Call Name
- Use short, descriptive identifiers

#### "Parent organization not found"
- Ensure Parent Org values match existing Call Names
- Use "N/A" for root-level organizations

#### "Circular reference detected"
- Check for organizations that reference themselves
- Verify the hierarchy doesn't create loops

## 🔄 Version History

### Version 1.1.0 (Current)
- ✅ English interface standardization
- ✅ Drag & drop row reordering
- ✅ Manager visibility toggle
- ✅ Empty Excel template export
- ✅ Current data Excel export
- ✅ Standalone HTML export
- ✅ Fullscreen display mode
- ✅ Enhanced color system with 15-color palette
- ✅ Improved data validation

### Version 1.0.0
- Basic organization chart generation
- Excel file import
- SVG/PNG export
- Data table editing
- Japanese interface

## 🤝 Contributing

### Development Setup
1. Clone the repository
2. Open `src/index.html` in a browser
3. Make changes to JavaScript files in `src/js/`
4. Test changes with sample data

### File Structure
```
src/
├── index.html              # Main application page
├── js/
│   ├── config.js           # Configuration and translations
│   ├── main.js             # Application initialization
│   ├── ui-controller.js    # UI management
│   ├── data-processor.js   # Data parsing and validation
│   ├── chart-renderer.js   # Chart visualization
│   ├── layout-calculator.js # Layout algorithms
│   ├── export-utils.js     # Export functionality
│   └── data-table-manager.js # Table editing
├── styles/
│   ├── main.css           # Main styles
│   └── components.css     # Component styles
└── templates/
    └── SampleData.xlsx    # Sample data file
```

## 📄 License

This project is licensed under the MIT License. See the LICENSE file for details.

## 🙋‍♂️ Support

For issues, questions, or feature requests:
1. Check the troubleshooting section above
2. Review the user guide for detailed instructions
3. Ensure you're using a supported browser version
4. Verify your Excel file format matches the requirements

## 🎉 Credits

Built with:
- **SheetJS**: Excel file processing
- **html2canvas**: PNG export functionality
- **Modern JavaScript**: ES6+ features
- **CSS Grid & Flexbox**: Responsive layouts