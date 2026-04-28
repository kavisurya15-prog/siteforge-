import { useState, useEffect } from 'react';
import { Type, Save, Package, AlertCircle, Loader2, Plus, Trash2 } from 'lucide-react';
import PropTypes from 'prop-types';

// Sub-component to manage editing keys without losing focus
function EditableKey({ initialKey, onRename }) {
  const [editingKey, setEditingKey] = useState(initialKey);

  useEffect(() => {
    setEditingKey(initialKey);
  }, [initialKey]);

  return (
    <input
      type="text"
      className="bg-transparent border-none text-[10px] text-gray-500 uppercase font-bold tracking-wider focus:outline-none focus:text-brand-gold w-full cursor-text hover:text-gray-400 transition-colors"
      value={editingKey}
      onChange={(e) => setEditingKey(e.target.value)}
      onBlur={() => {
        if (editingKey && editingKey !== initialKey) {
          onRename(initialKey, editingKey);
        } else {
          setEditingKey(initialKey); // Revert if empty
        }
      }}
    />
  );
}

EditableKey.propTypes = {
  initialKey: PropTypes.string.isRequired,
  onRename: PropTypes.func.isRequired
};

export default function ContentEditor({ projectPath }) {
  const [jsonData, setJsonData] = useState(null);
  const [arraySchemas, setArraySchemas] = useState({});
  const [jsonFiles, setJsonFiles] = useState([]);
  const [targetFile, setTargetFile] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  // Load available JSON files
  useEffect(() => {
    async function fetchJsonFiles() {
      if (!projectPath) return;
      try {
        const res = await window.electronAPI.invoke('list-json-files', projectPath);
        if (res.success && res.files.length > 0) {
          setJsonFiles(res.files);
          // Auto-select the first file if none is selected
          if (!targetFile) {
            // Prefer a file in src/data if available
            const preferred = res.files.find(f => f.includes('src/data/')) || res.files[0];
            setTargetFile(preferred);
          }
        } else {
          setError("No JSON files found in the project.");
        }
      } catch (err) {
        console.error("Failed to list json files:", err);
        setError("Failed to list JSON files.");
      }
    }
    fetchJsonFiles();
  }, [projectPath, targetFile]);

  useEffect(() => {
    async function loadJson() {
      if (!projectPath || !targetFile) return;
      try {
        const res = await window.electronAPI.invoke('read-json', projectPath, targetFile);
        if (res.success) {
          setJsonData(res.data);
          // Store schemas for arrays to allow adding items even if emptied
          const schemas = {};
          if (res.data) {
            Object.entries(res.data).forEach(([key, value]) => {
              if (Array.isArray(value) && value.length > 0) {
                schemas[key] = Object.keys(value[0]).reduce((acc, k) => ({ ...acc, [k]: '' }), {});
              }
            });
          }
          setArraySchemas(schemas);
          setError(null);
        } else {
          setError(res.error || "File not found");
        }
      } catch (error) {
        console.error("Failed to load json:", error);
        setError("Failed to communicate with system");
      }
    }
    loadJson();
  }, [projectPath, targetFile]);

  const handleSave = async () => {
    if (!projectPath || !jsonData) return;
    setIsSaving(true);
    try {
      const res = await window.electronAPI.invoke('write-json', projectPath, targetFile, jsonData);
      if (res.success) {
        // Saved successfully
      } else {
        setError("Failed to save changes");
      }
    } catch (error) {
      console.error("Failed to save json:", error);
      setError("Failed to communicate with system");
    } finally {
      setIsSaving(false);
    }
  };

  const handleFieldChange = (key, value) => {
    setJsonData(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleKeyRename = (oldKey, newKey) => {
    setJsonData(prev => {
      // Reconstruct object to maintain order
      const newObj = {};
      Object.keys(prev).forEach(k => {
        if (k === oldKey) {
          newObj[newKey] = prev[k];
        } else {
          newObj[k] = prev[k];
        }
      });
      return newObj;
    });
  };

  const handleArrayFieldChange = (arrayKey, index, fieldKey, value) => {
    setJsonData(prev => {
      const updatedArray = [...prev[arrayKey]];
      updatedArray[index] = { ...updatedArray[index], [fieldKey]: value };
      return {
        ...prev,
        [arrayKey]: updatedArray
      };
    });
  };

  const handleArrayKeyRename = (arrayKey, index, oldKey, newKey) => {
    setJsonData(prev => {
      const updatedArray = [...prev[arrayKey]];
      const item = updatedArray[index];

      const newItem = {};
      Object.keys(item).forEach(k => {
        if (k === oldKey) {
          newItem[newKey] = item[k];
        } else {
          newItem[k] = item[k];
        }
      });

      updatedArray[index] = newItem;

      return {
        ...prev,
        [arrayKey]: updatedArray
      };
    });

    // Also update schema if renaming in first item, so future additions have the new key
    if (index === 0) {
      setArraySchemas(prevSchemas => {
        const schema = prevSchemas[arrayKey];
        if (schema && oldKey in schema) {
          const newSchema = {};
          Object.keys(schema).forEach(k => {
            if (k === oldKey) {
              newSchema[newKey] = schema[k];
            } else {
              newSchema[k] = schema[k];
            }
          });
          return { ...prevSchemas, [arrayKey]: newSchema };
        }
        return prevSchemas;
      });
    }
  };

  const addArrayItem = (arrayKey) => {
    setJsonData(prev => {
      const currentArray = prev[arrayKey] || [];
      let newItem = {};
      if (currentArray.length > 0) {
        newItem = Object.keys(currentArray[0]).reduce((acc, key) => ({ ...acc, [key]: '' }), {});
      } else if (arraySchemas[arrayKey]) {
        newItem = { ...arraySchemas[arrayKey] };
      }
      return {
        ...prev,
        [arrayKey]: [...currentArray, newItem]
      };
    });
  };

  const removeArrayItem = (arrayKey, index) => {
    setJsonData(prev => {
      const updatedArray = [...prev[arrayKey]];
      updatedArray.splice(index, 1);
      return {
        ...prev,
        [arrayKey]: updatedArray
      };
    });
  };

  if (error && !jsonData) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-brand-darker">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4 opacity-50" />
        <h3 className="text-white font-bold mb-2">Editor Error</h3>
        <p className="text-gray-500 text-sm max-w-xs">{error}</p>
        {targetFile && <p className="text-xs text-gray-600 mt-4">Make sure your project has a {targetFile} file.</p>}
      </div>
    );
  }

  if (!jsonData && !error) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-brand-darker p-8 text-center">
        <Loader2 className="w-8 h-8 text-brand-gold animate-spin mb-4" />
        <div className="text-gray-400 text-sm font-medium">Loading data...</div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-brand-darker">
      <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-brand-darker/50 backdrop-blur-md sticky top-0 z-10">
        <div>
          <h2 className="text-xl font-bold text-white">Content Editor</h2>

          <select
            value={targetFile}
            onChange={(e) => {
              setTargetFile(e.target.value);
              setJsonData(null);
              setError(null);
            }}
            className="mt-2 bg-brand-dark border border-gray-700 text-gray-300 text-xs rounded px-2 py-1 focus:outline-none focus:border-brand-gold"
          >
            {jsonFiles.map(file => (
              <option key={file} value={file}>{file}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col items-end gap-2">
          <button
            onClick={handleSave}
            disabled={isSaving || !jsonData}
            className="bg-brand-gold hover:bg-yellow-500 text-black px-4 py-2 rounded-xl font-bold transition-all shadow-lg shadow-brand-gold/10 disabled:opacity-50 flex items-center gap-2 text-sm"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
          {error && <span className="text-[10px] text-red-500">{error}</span>}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
        {/* Render Primitives */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <div className="p-1.5 bg-brand-gold/10 rounded-lg">
              <Type className="w-4 h-4 text-brand-gold" />
            </div>
            <h3 className="text-white font-semibold text-sm">Store Details</h3>
          </div>
          <div className="grid grid-cols-1 gap-4">
            {jsonData && Object.entries(jsonData).map(([key, value]) => {
              if (typeof value !== 'object' || value === null) {
                return (
                  <div key={key} className="space-y-1.5">
                    <EditableKey initialKey={key} onRename={handleKeyRename} />
                    <input 
                      type="text"
                      className="bg-brand-dark border border-gray-800 text-white px-4 py-2.5 rounded-xl w-full text-sm focus:outline-none focus:border-brand-gold transition-colors"
                      value={value || ''}
                      onChange={(e) => handleFieldChange(key, e.target.value)}
                      placeholder={`Enter ${key}`}
                    />
                  </div>
                );
              }
              return null;
            })}
          </div>
        </section>

        {/* Render Arrays */}
        {jsonData && Object.entries(jsonData).map(([key, value]) => {
          if (Array.isArray(value)) {
            return (
              <section key={key}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-brand-gold/10 rounded-lg">
                      <Package className="w-4 h-4 text-brand-gold" />
                    </div>
                    <h3 className="text-white font-semibold text-sm capitalize">{key}</h3>
                  </div>
                  <span className="text-[10px] bg-white/5 text-gray-400 px-2 py-1 rounded-full font-mono border border-gray-800">
                    {value.length} ITEMS
                  </span>
                </div>

                <div className="space-y-3">
                  {value.map((item, index) => (
                    <div key={index} className="bg-brand-dark p-4 rounded-2xl border border-gray-800 hover:border-gray-700 transition-all group relative">
                      <button
                        onClick={() => removeArrayItem(key, index)}
                        className="absolute top-4 right-4 text-gray-500 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                        title="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <div className="grid grid-cols-1 gap-4 pr-6">
                        {Object.entries(item).map(([fieldKey, fieldValue]) => (
                          <div key={fieldKey} className="space-y-1">
                            <EditableKey
                              initialKey={fieldKey}
                              onRename={(oldK, newK) => handleArrayKeyRename(key, index, oldK, newK)}
                            />
                            <input
                              className="bg-transparent text-white border-b border-gray-800 hover:border-gray-700 focus:border-brand-gold p-1 w-full text-sm transition-colors outline-none"
                              value={fieldValue || ''}
                              onChange={(e) => handleArrayFieldChange(key, index, fieldKey, e.target.value)}
                              placeholder={fieldKey}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={() => addArrayItem(key)}
                    className="w-full py-3 border border-dashed border-gray-700 rounded-2xl text-gray-400 hover:text-brand-gold hover:border-brand-gold transition-all flex items-center justify-center gap-2 text-sm font-medium"
                  >
                    <Plus className="w-4 h-4" />
                    Add {key.replace(/s$/, '')}
                  </button>
                </div>
              </section>
            );
          }
          return null;
        })}
      </div>
    </div>
  );
}

ContentEditor.propTypes = {
  projectPath: PropTypes.string
};
