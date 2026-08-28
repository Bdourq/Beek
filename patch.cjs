const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const target = `  // Update handler for current report
  const handleUpdateReport = (updatedFields: Partial<DailyReport>) => {
    if (!currentReport) return;
    const updated: DailyReport = {
      ...currentReport,
      ...updatedFields,
      updatedAt: new Date().toISOString()
    };

    setCurrentReport(updated);
    saveReportLocally(updated);

    // Update in state list
    setReports((prev) =>
      prev.map((r) => (r.id === updated.id ? updated : r))
    );
  };`;

const replacement = `  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Update handler for current report
  const handleUpdateReport = useCallback((updatedFields: Partial<DailyReport>) => {
    setCurrentReport(prev => {
      if (!prev) return prev;
      const updated: DailyReport = {
        ...prev,
        ...updatedFields,
        updatedAt: new Date().toISOString()
      };
      
      // Update in state list
      setReports((prevList) =>
        prevList.map((r) => (r.id === updated.id ? updated : r))
      );

      // Debounce heavy localStorage writing
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      saveTimeoutRef.current = setTimeout(() => {
        saveReportLocally(updated);
      }, 500);

      return updated;
    });
  }, []);`;

code = code.replace(target, replacement);
fs.writeFileSync('src/App.tsx', code);
