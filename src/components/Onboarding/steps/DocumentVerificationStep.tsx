import { useState } from 'react';
import { Upload, File, Check, X } from 'lucide-react';

interface DocumentType {
  id: string;
  name: string;
  required: boolean;
}

interface Document {
  name: string;
  size: number;
  type: string;
}

interface FormData {
  documents: Record<string, Document>;
  agreementAccepted: boolean;
  [key: string]: any;
}

interface DocumentVerificationStepProps {
  initialData: Partial<FormData>;
  onSubmit: (data: FormData) => void;
  loading: boolean;
}

const documentTypes: DocumentType[] = [
  { id: 'id_verification', name: 'Government ID', required: true },
  { id: 'business_license', name: 'Business License', required: false },
  { id: 'tax_document', name: 'Tax Document', required: false },
  { id: 'proof_of_address', name: 'Proof of Address', required: true }
];

export function DocumentVerificationStep({ initialData, onSubmit, loading }: DocumentVerificationStepProps) {
  const [formData, setFormData] = useState<FormData>({
    documents: initialData?.documents || {},
    agreementAccepted: initialData?.agreementAccepted || false,
    ...initialData
  });

  const handleDocumentUpload = (documentType: string, file: File) => {
    const newDocs = { ...formData.documents };
    newDocs[documentType] = {
      name: file.name,
      size: file.size,
      type: file.type
    };
    setFormData(prevFormData => ({ ...prevFormData, documents: newDocs }));
  };

  const removeDocument = (documentType: string) => {
    const newDocs = { ...formData.documents };
    delete newDocs[documentType];
    setFormData(prevFormData => ({ ...prevFormData, documents: newDocs }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const isRequiredDocumentsUploaded = () => {
    const requiredTypes = documentTypes.filter(doc => doc.required);
    return requiredTypes.every(doc => formData.documents[doc.id]);
  };

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Document Verification</h2>
        <p className="text-gray-600">Upload required documents for account verification</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="space-y-6">
          {documentTypes.map((docType) => (
            <div key={docType.id} className="border border-gray-200 rounded-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    {docType.name}
                    {docType.required && <span className="text-red-500 ml-1">*</span>}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Upload a clear photo or scan of your {docType.name.toLowerCase()}
                  </p>
                </div>
                {formData.documents[docType.id] && (
                  <div className="flex items-center text-green-600">
                    <Check className="h-4 w-4 mr-1" />
                    <span className="text-sm">Uploaded</span>
                  </div>
                )}
              </div>

              {formData.documents[docType.id] ? (
                <div className="flex items-center justify-between bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <File className="h-8 w-8 text-green-600" />
                    <div>
                      <p className="text-sm font-medium text-green-900">
                        {formData.documents[docType.id].name}
                      </p>
                      <p className="text-xs text-green-600">
                        {(formData.documents[docType.id].size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeDocument(docType.id)}
                    className="text-red-600 hover:text-red-700 p-1"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors">
                  <Upload className="h-8 w-8 text-gray-400 mx-auto mb-4" />
                  <p className="text-sm text-gray-600 mb-2">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-gray-400 mb-4">
                    PNG, JPG, PDF up to 10MB
                  </p>
                  <input
                    type="file"
                    accept=".png,.jpg,.jpeg,.pdf"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        handleDocumentUpload(docType.id, file);
                      }
                    }}
                    className="hidden"
                    id={`upload-${docType.id}`}
                  />
                  <label
                    htmlFor={`upload-${docType.id}`}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    Choose File
                  </label>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
          <input
            type="checkbox"
            id="agreement"
            checked={formData.agreementAccepted}
            onChange={(e) => setFormData(prev => ({ ...prev, agreementAccepted: e.target.checked }))}
            className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="agreement" className="text-sm text-gray-700">
            I understand that the uploaded documents will be reviewed for verification purposes and 
            I consent to the processing of this information in accordance with the privacy policy.
          </label>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading || !isRequiredDocumentsUploaded() || !formData.agreementAccepted}
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-teal-600 text-white rounded-lg hover:from-blue-700 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {loading ? 'Saving...' : 'Continue'}
          </button>
        </div>
      </form>
    </div>
  );
}