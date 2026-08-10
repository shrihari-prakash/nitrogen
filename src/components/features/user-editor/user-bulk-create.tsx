import { useState, useRef, useCallback, ChangeEvent, DragEvent } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import usePermissions from "@/hooks/use-permissions";
import { useTranslation } from "react-i18next";
import { useCreateUser } from "@/hooks/api/use-users";
import { camelCaseToWords } from "@/utils/string";
import {
  parseUsersCsv,
  downloadSampleCsvTemplate,
  ParsedUserRow,
} from "@/utils/csv-parser";
import {
  LuUpload,
  LuFileSpreadsheet,
  LuDownload,
  LuCheck,
  LuCircleAlert,
  LuTrash2,
  LuRefreshCw,
  LuUsers,
  LuFileCheck,
  LuFileX,
  LuEye,
  LuEyeOff,
  LuLoader,
} from "react-icons/lu";

export const UserBulkCreate = () => {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [rows, setRows] = useState<ParsedUserRow[]>([]);
  const [headerError, setHeaderError] = useState<string | null>(null);
  const [filterTab, setFilterTab] = useState<"all" | "valid" | "invalid">("all");
  const [showPasswords, setShowPasswords] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successResponse, setSuccessResponse] = useState<{
    count: number;
    message: string;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const tableScrollRef = useRef<HTMLDivElement>(null);
  const { isPermissionAllowed } = usePermissions();
  const { mutateAsync: createUser } = useCreateUser();
  const { t } = useTranslation();

  const handleFileProcess = (selectedFile: File) => {
    if (!selectedFile.name.endsWith(".csv") && selectedFile.type !== "text/csv") {
      toast.error(t("error.select-valid-csv"));
      return;
    }

    setFile(selectedFile);
    setHeaderError(null);
    setSuccessResponse(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (!text) {
        setHeaderError(t("error.read-file-failed"));
        return;
      }

      const result = parseUsersCsv(text);
      if (result.headerError) {
        setHeaderError(result.headerError);
        setRows([]);
      } else {
        setRows(result.rows);
      }
    };
    reader.readAsText(selectedFile);
  };

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileProcess(e.target.files[0]);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const handleReset = () => {
    setFile(null);
    setRows([]);
    setHeaderError(null);
    setFilterTab("all");
    setSuccessResponse(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDeleteRow = (id: string) => {
    setRows((prev) => prev.filter((r) => r.id !== id));
  };

  const validRows = rows.filter((r) => r.isValid && !r.serverError && !r.isImported);
  const invalidRows = rows.filter((r) => !r.isValid || !!r.serverError);

  const filteredRows = rows.filter((row) => {
    if (filterTab === "valid") return row.isValid && !row.serverError;
    if (filterTab === "invalid") return !row.isValid || !!row.serverError;
    return true;
  });

  const ROW_HEIGHT = 40;

  const virtualizer = useVirtualizer({
    count: filteredRows.length,
    getScrollElement: () => tableScrollRef.current,
    estimateSize: useCallback(() => ROW_HEIGHT, []),
    overscan: 10,
  });

  async function handleSubmitBulk() {
    if (validRows.length === 0) {
      toast.error(t("error.no-valid-rows"));
      return;
    }

    setSubmitting(true);
    const payload = validRows.map((r) => r.data);

    try {
      await createUser(payload as any);
      toast.success(t("message.imported-users-success", { count: validRows.length }));

      const importedCount = validRows.length;

      // Mark imported rows with isImported: true so they reflect success status
      setRows((prev) =>
        prev.map((r) =>
          r.isValid && !r.serverError ? { ...r, isImported: true } : r
        )
      );

      setSuccessResponse({
        count: importedCount,
        message: t("message.users-created-success", { count: importedCount }),
      });
    } catch (error: any) {
      console.error("Bulk upload API error:", error);
      const resData = error?.response?.data || error?.data || error;
      const additionalInfo = resData?.additionalInfo;

      // Map validRow index to server error messages
      const serverErrorsByValidIndex: Record<number, string[]> = {};

      if (Array.isArray(additionalInfo?.errors)) {
        additionalInfo.errors.forEach((err: any) => {
          const rawPath: string = err.path || err.param || "";
          const match = rawPath.match(/\[?(\d+)\]?/);
          if (match) {
            const index = parseInt(match[1], 10);
            const fieldName = rawPath.replace(/\[?\d+\]?\.?/, "");
            const label = fieldName ? camelCaseToWords(fieldName) : "Field";
            const valStr = err.value !== undefined && typeof err.value !== "object" ? ` (${err.value})` : "";
            const msg = `${label}: ${err.msg || "Invalid value"}${valStr}`;

            if (!serverErrorsByValidIndex[index]) {
              serverErrorsByValidIndex[index] = [];
            }
            serverErrorsByValidIndex[index].push(msg);
          }
        });
      }

      let failedCount = 0;

      setRows((prevRows) => {
        let validIndexCounter = 0;

        return prevRows.map((row) => {
          if (!row.isValid) return row;

          const currentValidIdx = validIndexCounter++;
          let rowServerError: string | undefined = undefined;

          // Check direct index match from Liquid validator
          if (serverErrorsByValidIndex[currentValidIdx]?.length) {
            rowServerError = serverErrorsByValidIndex[currentValidIdx].join("; ");
          }

          // Check duplicate existing user match
          if (!rowServerError && Array.isArray(additionalInfo?.existingUsers)) {
            const isMatch = additionalInfo.existingUsers.some(
              (ex: any) =>
                (ex.username && ex.username.toLowerCase() === row.data.username.toLowerCase()) ||
                (ex.email && ex.email.toLowerCase() === row.data.email.toLowerCase())
            );
            if (isMatch) {
              rowServerError = t("error.user-exists");
            }
          }

          if (rowServerError) {
            failedCount++;
            return {
              ...row,
              isValid: false,
              serverError: rowServerError,
            };
          }

          return row;
        });
      });

      const genericError =
        resData?.error === "insufficient-privileges" || resData?.error === "InsufficientPrivileges"
          ? t("error.insufficient-privileges")
          : resData?.message || error?.message || t("error.bulk-upload-failed");

      if (failedCount > 0) {
        toast.error(t("error.rows-failed-validation", { count: failedCount }));
        setFilterTab("invalid");
      } else {
        toast.error(genericError);
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (!isPermissionAllowed("admin:profile:create:write")) {
    return null;
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" className="gap-2" data-t="bulk-upload-users-button">
          <LuFileSpreadsheet className="h-4 w-4 text-primary" />
          {t("button.bulk-upload")}
        </Button>
      </SheetTrigger>
      <SheetContent
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
        className="w-full md:!max-w-[700px] overflow-y-auto flex flex-col justify-between p-0 gap-0"
      >
        <SheetHeader className="p-6 pb-4 border-b border-border/40 bg-card/60">
          <div className="flex items-center justify-between flex-col md:flex-row">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/15">
                <LuUsers className="h-5 w-5" />
              </div>
              <div className="">
                <SheetTitle className="text-xl font-bold tracking-tight text-left">
                  {t("heading.bulk-upload-users")}
                </SheetTitle>
                <SheetDescription className="text-xs text-muted-foreground mt-0.5">
                  {t("message.bulk-upload-subtitle")}
                </SheetDescription>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={downloadSampleCsvTemplate}
              className="gap-1.5 text-xs h-8 border-border/70 mr-0 mt-2 md:mr-6 md:mt-0"
            >
              <LuDownload className="h-3.5 w-3.5" />
              {t("action.download-template")}
            </Button>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* File Upload Dropzone */}
          {!file ? (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center gap-3 ${isDragging
                ? "border-primary bg-primary/10 scale-[0.99]"
                : "border-border/70 hover:border-primary/50 hover:bg-accent/40 bg-muted/20"
                }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,text/csv"
                onChange={handleFileSelect}
                className="hidden"
              />
              <div className="p-4 rounded-full bg-background border border-border/50 shadow-sm text-primary">
                <LuUpload className="h-8 w-8" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {t("message.bulk-upload-dropzone")}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {t("message.bulk-upload-supported-headers")}
                </p>
              </div>
              <Button type="button" variant="secondary" size="sm" className="mt-2 text-xs font-semibold">
                {t("button.select-csv-file")}
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-between p-3 rounded-xl border border-border/60 bg-card shadow-xs">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <LuFileSpreadsheet className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {t("message.file-parsed-summary", { size: (file.size / 1024).toFixed(1), count: rows.length })}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReset}
                disabled={submitting}
                className="gap-1 text-xs text-muted-foreground hover:text-foreground"
              >
                <LuRefreshCw className={`h-3.5 w-3.5 ${submitting ? "animate-spin" : ""}`} />
                {t("button.change-file")}
              </Button>
            </div>
          )}

          {/* Success Response Banner */}
          {successResponse && (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-start justify-between gap-3 text-xs font-medium">
              <div className="flex items-center gap-2.5">
                <LuFileCheck className="h-5 w-5 shrink-0 text-emerald-500" />
                <div>
                  <p className="font-semibold text-sm mb-0.5">{t("heading.import-complete")}</p>
                  <p>{successResponse.message}</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                className="gap-1 text-xs h-8 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10"
              >
                <LuRefreshCw className="h-3.5 w-3.5" />
                {t("button.upload-another")}
              </Button>
            </div>
          )}

          {/* Header Error Banner */}
          {headerError && (
            <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive flex items-start gap-3 text-xs font-medium">
              <LuCircleAlert className="h-4 w-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-sm mb-0.5">{t("message.invalid-csv-structure")}</p>
                <p>{headerError}</p>
              </div>
            </div>
          )}

          {/* Parsed Rows Metrics & Filter Tabs */}
          {rows.length > 0 && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl border border-border/60 bg-card/60 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">{t("label.total-parsed")}</p>
                    <p className="text-xl font-bold text-foreground mt-0.5">{rows.length}</p>
                  </div>
                  <LuUsers className="h-5 w-5 text-muted-foreground/60" />
                </div>

                <div className="p-3.5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">{t("label.ready-to-import")}</p>
                    <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                      {validRows.length}
                    </p>
                  </div>
                  <LuFileCheck className="h-5 w-5 text-emerald-500" />
                </div>

                <div className="p-3.5 rounded-xl border border-destructive/20 bg-destructive/5 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-destructive font-medium">{t("label.action-required")}</p>
                    <p className="text-xl font-bold text-destructive mt-0.5">{invalidRows.length}</p>
                  </div>
                  <LuFileX className="h-5 w-5 text-destructive" />
                </div>
              </div>

              {/* Table Filter Segmented Control */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pt-1">
                <div className="flex items-center gap-1 p-1 bg-muted/60 rounded-xl border border-border/40 w-full sm:w-auto overflow-x-auto">
                  <button
                    type="button"
                    onClick={() => setFilterTab("all")}
                    className={`flex-1 sm:flex-none text-center px-3 py-1 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${filterTab === "all"
                      ? "bg-background text-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                      }`}
                  >
                    {t("label.all-rows", { count: rows.length })}
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterTab("valid")}
                    className={`flex-1 sm:flex-none text-center px-3 py-1 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${filterTab === "valid"
                      ? "bg-background text-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                      }`}
                  >
                    {t("label.valid-only", { count: validRows.length })}
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterTab("invalid")}
                    className={`flex-1 sm:flex-none text-center px-3 py-1 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${filterTab === "invalid"
                      ? "bg-background text-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                      }`}
                  >
                    {t("label.errors-only", { count: invalidRows.length })}
                  </button>
                </div>
                <span className="text-xs text-muted-foreground font-medium self-end sm:self-center">
                  {t("message.showing-n-of-m-rows", { filtered: filteredRows.length, total: rows.length })}
                </span>
              </div>

              {/* Preview Data Table (Virtualized) */}
              <div className="rounded-xl border border-border/60 overflow-hidden bg-card shadow-xs relative">
                {submitting && (
                  <div className="absolute inset-0 bg-background/75 backdrop-blur-[2px] z-30 flex flex-col items-center justify-center gap-2 transition-all duration-200">
                    <div className="p-3.5 rounded-full bg-primary/15 border border-primary/30 shadow-lg">
                      <LuLoader className="h-7 w-7 text-primary animate-spin" />
                    </div>
                    <p className="text-sm text-center text-muted-foreground mt-0.5 p-6">
                      {t("message.importing-users-subtitle", { count: validRows.length })}
                    </p>
                  </div>
                )}
                <div ref={tableScrollRef} className="max-h-72 overflow-y-auto relative">
                  <Table>
                    <TableHeader className="bg-muted/50 sticky top-0 z-20 backdrop-blur-md">
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="w-12 text-center text-xs">#</TableHead>
                        <TableHead className="w-28 text-xs">{t("label.status")}</TableHead>
                        <TableHead className="text-xs">{t("label.username")}</TableHead>
                        <TableHead className="text-xs">{t("label.first-name")}</TableHead>
                        <TableHead className="text-xs">{t("label.email")}</TableHead>
                        <TableHead className="text-xs">
                          <div className="flex items-center gap-1.5">
                            <span>{t("label.password")}</span>
                            <button
                              type="button"
                              onClick={() => setShowPasswords(!showPasswords)}
                              className="text-muted-foreground hover:text-foreground p-0.5 rounded transition-colors"
                              title={showPasswords ? t("action.mask-passwords") : t("action.show-passwords")}
                            >
                              {showPasswords ? <LuEyeOff className="h-3 w-3" /> : <LuEye className="h-3 w-3" />}
                            </button>
                          </div>
                        </TableHead>
                        <TableHead className="text-xs">{t("label.role")}</TableHead>
                        <TableHead className="text-xs whitespace-nowrap">{t("label.phone")}</TableHead>
                        <TableHead className="w-12 text-center text-xs">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredRows.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={9} className="h-24 text-center text-xs text-muted-foreground">
                            {t("message.no-rows-match-filter")}
                          </TableCell>
                        </TableRow>
                      ) : (
                        <>
                          {/* Virtual Spacer Top */}
                          {virtualizer.getVirtualItems().length > 0 && (
                            <tr style={{ height: `${virtualizer.getVirtualItems()[0].start}px` }} />
                          )}

                          {virtualizer.getVirtualItems().map((virtualRow) => {
                            const row = filteredRows[virtualRow.index];
                            if (!row) return null;

                            const isRowValid = row.isValid && !row.serverError;
                            const errList = Object.entries(row.errors)
                              .map(([k, v]) => `${k}: ${v}`)
                              .concat(row.serverError ? [row.serverError] : []);

                            const phoneDisplay = [row.data.phoneCountryCode, row.data.phone]
                              .filter(Boolean)
                              .join(" ");

                            return (
                              <TableRow
                                key={row.id}
                                className={
                                  !isRowValid ? "bg-destructive/5 hover:bg-destructive/10" : undefined
                                }
                                style={{ height: `${virtualRow.size}px` }}
                              >
                                <TableCell className="text-center text-xs font-mono text-muted-foreground">
                                  {row.rowIndex}
                                </TableCell>
                                <TableCell>
                                  {row.isImported ? (
                                    <Badge variant="secondary" className="bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 gap-1 text-[10px]">
                                      <LuCheck className="h-3 w-3" /> {t("label.imported")}
                                    </Badge>
                                  ) : isRowValid ? (
                                    <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 gap-1 text-[10px]">
                                      <LuCheck className="h-3 w-3" /> {t("label.valid")}
                                    </Badge>
                                  ) : (
                                    <Badge variant="destructive" className="gap-1 text-[10px]" title={errList.join(", ")}>
                                      <LuCircleAlert className="h-3 w-3" /> {t("label.invalid")}
                                    </Badge>
                                  )}
                                </TableCell>
                                <TableCell className="text-xs font-mono font-medium">
                                  {row.data.username || <span className="text-muted-foreground italic">{t("label.missing")}</span>}
                                </TableCell>
                                <TableCell className="text-xs">
                                  {[row.data.firstName, row.data.lastName].filter(Boolean).join(" ") || (
                                    <span className="text-muted-foreground italic">—</span>
                                  )}
                                </TableCell>
                                <TableCell className="text-xs font-mono">
                                  {row.data.email || <span className="text-muted-foreground italic">{t("label.missing")}</span>}
                                </TableCell>
                                <TableCell className="text-xs font-mono">
                                  {row.data.password ? (
                                    showPasswords ? (
                                      row.data.password
                                    ) : (
                                      <span className="text-muted-foreground font-sans">••••••••</span>
                                    )
                                  ) : (
                                    <span className="text-muted-foreground italic">{t("label.missing")}</span>
                                  )}
                                </TableCell>
                                <TableCell className="text-xs capitalize whitespace-nowrap">
                                  {row.data.role || "user"}
                                </TableCell>
                                <TableCell className="text-xs font-mono whitespace-nowrap">
                                  {phoneDisplay || <span className="text-muted-foreground italic">—</span>}
                                </TableCell>
                                <TableCell className="text-center">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleDeleteRow(row.id)}
                                    disabled={submitting}
                                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                                    title={t("action.remove-row")}
                                  >
                                    <LuTrash2 className="h-3.5 w-3.5" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            );
                          })}

                          {/* Virtual Spacer Bottom */}
                          {virtualizer.getVirtualItems().length > 0 && (
                            <tr
                              style={{
                                height: `${virtualizer.getTotalSize() -
                                  virtualizer.getVirtualItems()[virtualizer.getVirtualItems().length - 1].end
                                  }px`,
                              }}
                            />
                          )}
                        </>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Display list of specific errors if any invalid rows exist */}
              {invalidRows.length > 0 && filterTab !== "valid" && (
                <div className="p-3.5 rounded-xl border border-destructive/30 bg-destructive/5 text-destructive text-xs space-y-1.5">
                  <p className="font-bold flex items-center gap-1.5">
                    <LuCircleAlert className="h-4 w-4" />
                    {t("message.validation-issues", { count: invalidRows.length })}
                  </p>
                  <ul className="list-disc list-inside space-y-1 pl-1 text-[11px] font-mono">
                    {invalidRows.slice(0, 5).map((r) => {
                      const msg =
                        r.serverError ||
                        Object.entries(r.errors)
                          .map(([f, m]) => `${f}: ${m}`)
                          .join(", ");
                      return (
                        <li key={r.id}>
                          {t("label.row-error-summary", {
                            index: r.rowIndex,
                            username: r.data.username || t("label.unnamed"),
                            msg,
                          })}
                        </li>
                      );
                    })}
                    {invalidRows.length > 5 && (
                      <li className="list-none font-sans italic opacity-80 pt-0.5">
                        {t("message.more-invalid-rows", { count: invalidRows.length - 5 })}
                      </li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        <SheetFooter className="p-4 border-t border-border/40 bg-card/60 flex items-center justify-between sm:justify-between">
          <Button variant="ghost" size="sm" onClick={() => setOpen(false)} className="text-xs hidden md:block" disabled={submitting}>
            {t("button.cancel")}
          </Button>
          <div className="flex items-center gap-2">
            {rows.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                className="text-xs"
                disabled={submitting}
              >
                {t("button.reset")}
              </Button>
            )}
            <Button
              onClick={handleSubmitBulk}
              disabled={validRows.length === 0 || submitting}
              className="gap-2 text-xs font-semibold"
            >
              {submitting ? (
                <LuLoader className="h-4 w-4 animate-spin" />
              ) : (
                <LuUsers className="h-4 w-4" />
              )}
              {submitting
                ? t("button.importing-users")
                : t("button.import-users", { count: validRows.length })}
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default UserBulkCreate;
