import { z } from "zod";

export interface ParsedUserRow {
  id: string;
  rowIndex: number;
  data: {
    username: string;
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role?: string;
    phone?: string;
    phoneCountryCode?: string;
  };
  isValid: boolean;
  isImported?: boolean;
  errors: Partial<Record<string, string>>;
  serverError?: string;
}

export interface ParseCsvResult {
  rows: ParsedUserRow[];
  totalRows: number;
  validCount: number;
  invalidCount: number;
  headerError?: string;
}

const rowSchema = z.object({
  username: z
    .string()
    .min(1, "Username is required")
    .min(6, "Username must be at least 6 characters")
    .max(30, "Username must not exceed 30 characters")
    .regex(
      /^[a-zA-Z0-9_.]+$/,
      "Can only contain letters, numbers, underscores, and dots"
    ),
  firstName: z
    .string()
    .min(1, "First name is required")
    .max(32, "First name must not exceed 32 characters"),
  lastName: z
    .string()
    .min(1, "Last name is required")
    .max(32, "Last name must not exceed 32 characters"),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Must be a valid email address"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password must not exceed 128 characters"),
  role: z.string().optional(),
  phone: z
    .string()
    .optional()
    .refine(
      (val) => !val || (val.length >= 10 && val.length <= 12),
      "Phone number must be between 10 and 12 digits"
    ),
  phoneCountryCode: z.string().optional(),
});

/**
 * Splits a CSV line into cells, correctly handling quoted fields with commas.
 */
function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let currentCell = "";
  let insideQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (insideQuotes && line[i + 1] === '"') {
        currentCell += '"';
        i++;
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if (char === "," && !insideQuotes) {
      result.push(currentCell.trim());
      currentCell = "";
    } else {
      currentCell += char;
    }
  }
  result.push(currentCell.trim());
  return result;
}

/**
 * Parse CSV text into validated user rows.
 */
export function parseUsersCsv(csvText: string): ParseCsvResult {
  const normalizedText = csvText.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const rawLines = normalizedText
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (rawLines.length === 0) {
    return {
      rows: [],
      totalRows: 0,
      validCount: 0,
      invalidCount: 0,
      headerError: "The uploaded CSV file is empty.",
    };
  }

  const rawHeaders = parseCsvLine(rawLines[0]);
  const headers = rawHeaders.map((h) => h.toLowerCase().replace(/[^a-z0-9]/gi, ""));

  const requiredFields = ["username", "firstname", "lastname", "email", "password"];
  const missingHeaders = requiredFields.filter(
    (field) => !headers.includes(field)
  );

  if (missingHeaders.length > 0) {
    return {
      rows: [],
      totalRows: 0,
      validCount: 0,
      invalidCount: 0,
      headerError: `Missing required header column(s): ${missingHeaders.join(", ")}. Headers found: ${rawHeaders.join(", ")}`,
    };
  }

  // Header mapping dictionary
  const headerMap: Record<string, number> = {};
  headers.forEach((h, index) => {
    if (h === "username") headerMap["username"] = index;
    if (h === "firstname" || h === "first_name") headerMap["firstName"] = index;
    if (h === "lastname" || h === "last_name") headerMap["lastName"] = index;
    if (h === "email" || h === "emailaddress") headerMap["email"] = index;
    if (h === "password") headerMap["password"] = index;
    if (h === "role") headerMap["role"] = index;
    if (h === "phone") headerMap["phone"] = index;
    if (h === "phonecountrycode" || h === "countrycode") headerMap["phoneCountryCode"] = index;
  });

  const parsedRows: ParsedUserRow[] = [];
  let validCount = 0;
  let invalidCount = 0;

  for (let i = 1; i < rawLines.length; i++) {
    const line = rawLines[i];
    const cells = parseCsvLine(line);

    const getVal = (key: string) => {
      const idx = headerMap[key];
      return idx !== undefined && idx < cells.length ? cells[idx] : "";
    };

    const rawData = {
      username: getVal("username"),
      firstName: getVal("firstName"),
      lastName: getVal("lastName"),
      email: getVal("email"),
      password: getVal("password"),
      role: getVal("role") || undefined,
      phone: getVal("phone") || undefined,
      phoneCountryCode: getVal("phoneCountryCode") || undefined,
    };

    const validation = rowSchema.safeParse(rawData);
    const errors: Partial<Record<string, string>> = {};

    if (!validation.success) {
      validation.error.issues.forEach((issue) => {
        const field = issue.path[0] as string;
        if (field && !errors[field]) {
          errors[field] = issue.message;
        }
      });
      invalidCount++;
    } else {
      validCount++;
    }

    parsedRows.push({
      id: `row-${i}-${Date.now()}`,
      rowIndex: i + 1,
      data: rawData,
      isValid: validation.success,
      errors,
    });
  }

  return {
    rows: parsedRows,
    totalRows: parsedRows.length,
    validCount,
    invalidCount,
  };
}

/**
 * Triggers browser download of a ready-to-use sample CSV template.
 */
export function downloadSampleCsvTemplate() {
  const sampleCsvContent = `username,firstName,lastName,email,password,role,phoneCountryCode,phone
john_doe,John,Doe,john.doe@example.com,Password123!,user,+1,5550199123
jane_smith,Jane,Smith,jane.smith@example.com,SecurePass456!,user,+1,5550188456
alex_admin,Alex,Morgan,alex.morgan@example.com,AdminPass789!,admin,+44,7911123456`;

  const blob = new Blob([sampleCsvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", "users_upload_template.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
