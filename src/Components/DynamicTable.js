import React, { useState, useEffect } from "react";

const EditableTable = () => {
  // Initial state for table rows
  const [rows, setRows] = useState([
    { column1: "", column2: "", column3: "" },
  ]);

  // Handler to update a specific cell value
  const handleInputChange = (rowIndex, columnName, value) => {
    const updatedRows = [...rows];
    updatedRows[rowIndex][columnName] = value;
    setRows(updatedRows);
  };

  // Handler to add a new row
  const addRow = () => {
    setRows([...rows, { column1: "", column2: "", column3: "" }]);
  };

  // Add event listener for Ctrl+D shortcut
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.key === "d") {
        e.preventDefault(); // Prevent default browser behavior for Ctrl+D
        addRow();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    // Cleanup event listener on component unmount
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [rows]); // Dependency on rows ensures the latest addRow function is used

  return (
    <div>
      <table border="1" style={{ borderCollapse: "collapse", width: "100%" }}>
        <thead>
          <tr>
            <th>Column 1</th>
            <th>Column 2</th>
            <th>Column 3</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {Object.keys(row).map((columnName, colIndex) => (
                <td key={colIndex}>
                  <input
                    type="text"
                    value={row[columnName]}
                    onChange={(e) =>
                      handleInputChange(rowIndex, columnName, e.target.value)
                    }
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <p style={{ marginTop: "10px" }}>
        Use <strong>Ctrl+D</strong> to add a new row.
      </p>
    </div>
  );
};

export default EditableTable;
