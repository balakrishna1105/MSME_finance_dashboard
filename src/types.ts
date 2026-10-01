export type ActiveScreen = 
  | 'gateway'
  | 'dashboard'
  | 'upload-queue'
  | 'review-hitl'
  | 'schema-builder'
  | 'user-management'
  | 'all-documents'
  | 'history-audit'
  | 'analytics-sla'
  | 'engine-apis';

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  role: string;
  roleTag: string;
  department: string;
  initials: string;
  scope: string;
  scopeDetails: string;
  mfaProvider: string;
  mfaType: 'fido' | 'okta' | 'totp' | 'pending';
  lastActivity: string;
  location: string;
  status: 'Active' | 'Pending Invite' | 'Suspended';
}

export interface DocumentRecord {
  id: string;
  time: string;
  fileName: string;
  docType: string;
  customerName: string;
  invoiceNumber: string;
  invoiceDate: string;
  gstin: string;
  totalAmount: number;
  currencySymbol: string;
  status: 'valid' | 'review' | 'failed' | 'sealed';
  confidence: number;
  confidenceLabel: string;
  hasIssue?: boolean;
  issueType?: string;
  issueDescription?: string;
  datePartition: string;
  subtotal?: number;
  taxAmount?: number;
  taxRate?: number;
  notes?: string;
}

export interface QueuePipelineItem {
  id: string;
  fileName: string;
  fileSize: string;
  pages: number;
  engine: string;
  status: 'active' | 'completed' | 'preprocessing' | 'math_check' | 'failed' | 'queued';
  stageNumber: number;
  stageName: string;
  progressPercent: number;
  eta: string;
  details: string;
  confidence?: number;
  date?: string;
  extractedCount?: number;
  totalFields?: number;
  priority?: number;
  errorCode?: string;
}

export interface SchemaField {
  id: string;
  fieldName: string;
  aliases: string[];
  dataType: 'TEXT' | 'ALPHANUMERIC' | 'DATE (YYYY-MM-DD)' | 'CURRENCY (INR/USD)' | 'CURRENCY' | 'ENUM (4)' | 'TEXT (MULTILINE)';
  required: boolean;
  validationRule: string;
  minConfidence: number;
  status: 'Active' | 'Draft' | 'Deprecated';
  targetKey: string;
  dataCast: string;
}

export interface SecurityPolicies {
  sessionExpiry14d: boolean;
  fido2ForSchema: boolean;
  ipWhitelisting: boolean;
  activeCidrs: string[];
}
