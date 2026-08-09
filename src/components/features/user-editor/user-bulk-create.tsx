import { useState, useRef, ChangeEvent, DragEvent } from "react";
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

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { isPermissionAllowed } = usePermissions();
  const { mutateAsync: createUser } = useCreateUser();
  const { t } = useTranslation();

  const handleFileProcess = (selectedFile: File) => {
    if (!selectedFile.name.endsWith(".csv") && selectedFile.type !== "text/csv") {
      toast.error("Please select a valid .csv file");
      return;
    }

    setFile(selectedFile);
    setHeaderError(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (!text) {
        setHeaderError("Failed to read file contents");
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
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDeleteRow = (id: string) => {
    setRows((prev) => prev.filter((r) => r.id !== id));
  };

  const validRows = rows.filter((r) => r.isValid && !r.serverError);
  const invalidRows = rows.filter((r) => !r.isValid || !!r.serverError);

  const filteredRows = rows.filter((row) => {
    if (filterTab === "valid") return row.isValid && !row.serverError;
    if (filterTab === "invalid") return !row.isValid || !!row.serverError;
    return true;
  });

  async function handleSubmitBulk() {
    if (validRows.length === 0) {
      toast.error("No valid user rows to import");
      return;
    }

    setSubmitting(true);
    const payload = validRows.map((r) => r.data);

    try {
      await createUser(payload as any);
      toast.success(`Successfully imported ${validRows.length} users!`);
      handleReset();
      setOpen(false);
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
              rowServerError = "User with this username or email already exists";
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
          ? "Insufficient privileges to create users"
          : resData?.message || error?.message || "Bulk user creation failed";

      if (failedCount > 0) {
        toast.error(`${failedCount} row(s) failed server validation. Please review error details.`);
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
        <Button variant="outline" className="gap-2 border-border/80 shadow-xs" data-t="bulk-upload-users-button">
          <LuFileSpreadsheet className="h-4 w-4 text-primary" />
          {t("button.bulk-upload")}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full md:!max-w-[700px] overflow-y-auto flex flex-col justify-between p-0 gap-0">
        <SheetHeader className="p-6 pb-4 border-b border-border/40 bg-card/60">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/15">
                <LuUsers className="h-5 w-5" />
              </div>
              <div>
                <SheetTitle className="text-xl font-bold tracking-tight">
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
              className="gap-1.5 text-xs h-8 border-border/70 mr-6"
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
              className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center gap-3 ${
                isDragging
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
                Select CSV File
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-between p-4 rounded-xl border border-border/60 bg-card shadow-xs">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <LuFileSpreadsheet className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(file.size / 1024).toFixed(1)} KB • {rows.length} total rows parsed
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReset}
                className="gap-1.5 text-xs text-muted-foreground hover:text-foreground"
              >
                <LuRefreshCw className="h-3.5 w-3.5" />
                Change File
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
                    className={`flex-1 sm:flex-none text-center px-3 py-1 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
                      filterTab === "all"
                        ? "bg-background text-foreground shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {t("label.all-rows", { count: rows.length })}
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterTab("valid")}
                    className={`flex-1 sm:flex-none text-center px-3 py-1 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
                      filterTab === "valid"
                        ? "bg-background text-foreground shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {t("label.valid-only", { count: validRows.length })}
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterTab("invalid")}
                    className={`flex-1 sm:flex-none text-center px-3 py-1 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
                      filterTab === "invalid"
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

              {/* Preview Data Table */}
              <div className="rounded-xl border border-border/60 overflow-hidden bg-card shadow-xs">
                <div className="max-h-72 overflow-y-auto">
                  <Table>
                    <TableHeader className="bg-muted/50 sticky top-0 z-10 backdrop-blur-md">
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
                              title={showPasswords ? "Mask passwords" : "Show plain text passwords"}
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
                            No rows match the selected filter.
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredRows.map((row) => {
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
                            >
                              <TableCell className="text-center text-xs font-mono text-muted-foreground">
                                {row.rowIndex}
                              </TableCell>
                              <TableCell>
                                {isRowValid ? (
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
                                {row.data.username || <span className="text-muted-foreground italic">missing</span>}
                              </TableCell>
                              <TableCell className="text-xs">
                                {[row.data.firstName, row.data.lastName].filter(Boolean).join(" ") || (
                                  <span className="text-muted-foreground italic">—</span>
                                )}
                              </TableCell>
                              <TableCell className="text-xs font-mono">
                                {row.data.email || <span className="text-muted-foreground italic">missing</span>}
                              </TableCell>
                              <TableCell className="text-xs font-mono">
                                {row.data.password ? (
                                  showPasswords ? (
                                    row.data.password
                                  ) : (
                                    <span className="text-muted-foreground font-sans">••••••••</span>
                                  )
                                ) : (
                                  <span className="text-muted-foreground italic">missing</span>
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
                                  className="h-7 w-7 text-muted-foreground hover:text-destructive"
                                  title="Remove row"
                                >
                                  <LuTrash2 className="h-3.5 w-3.5" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })
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
                          Row {r.rowIndex} ({r.data.username || "unnamed"}): {msg}
                        </li>
                      );
                    })}
                    {invalidRows.length > 5 && (
                      <li className="list-none font-sans italic opacity-80 pt-0.5">
                        ...and {invalidRows.length - 5} more invalid row(s).
                      </li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        <SheetFooter className="p-4 border-t border-border/40 bg-card/60 flex items-center justify-between sm:justify-between">
          <Button variant="ghost" size="sm" onClick={() => setOpen(false)} className="text-xs">
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
              <LuUsers className="h-4 w-4" />
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
