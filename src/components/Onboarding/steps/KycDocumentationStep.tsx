import { useState } from 'react';
import { supabase, KycDocument } from '../../../lib/supabase';
import { Upload, File, Check, X, AlertCircle } from 'lucide-react';

interface KycDocumentationStepProps {
  initialData: { documents?: Record<string, Partial<KycDocument>> } | null;
  onSubmit: (data: { documents: Record<string, Partial<KycDocument>> }) => void;
  onBack: () => void;
  loading: boolean;
  userId: string;
}

const documentTypes = [
  { id: 'pan', name: 'PAN Card', required: true },
  { id: 'aadhaar_front', name: 'Aadhaar Card (Front)', required: true },
  { id: 'aadhaar_back', name: 'Aadhaar Card (Back)', required: true },
  { id: 'bank_statement', name: 'Bank Statement', required: true },
  { id: 'photo', name: 'Passport Size Photo', required: true },
  { id: 'signature', name: 'Signature', required: true }
];

export function KycDocumentationStep({ initialData, onSubmit, onBack, loading, userId }: KycDocumentationStepProps) {
  const [documents, setDocuments] = useState<Record<string, Partial<KycDocument>>>(initialData?.documents || {});
  const [uploading, setUploading] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleFileUpload = async (documentType: string, file: File) => {
    setUploading(prev => ({ ...prev, [documentType]: true }));
    setErrors(prev => ({ ...prev, [documentType]: '' }));

    try {
      // Upload file to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${documentType}_${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('kyc-documents')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL for the uploaded file
      const { data: { publicUrl } } = supabase.storage
        .from('kyc-documents')
        .getPublicUrl(fileName);

      const newDocument: Partial<KycDocument> = {
        user_id: userId,
        document_type: documentType,
        file_name: file.name,
        file_url: publicUrl,
        file_size: file.size,
        mime_type: file.type,
        verification_status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      setDocuments(prev => ({
        ...prev,
        [documentType]: newDocument
      }));
    } catch (error) {
      console.error('Error uploading file:', error);
      setErrors(prev => ({ ...prev, [documentType]: (error as Error).message || 'Failed to upload document. Please try again.' }));
    } finally {
      setUploading(prev => ({ ...prev, [documentType]: false }));
    }
  };

  const removeDocument = async (documentType: string) => {
    try {
      const document = documents[documentType];
      if (document?.file_url) {
        // Extract file path from URL
        const url = new URL(document.file_url);
        const filePath = url.pathname.split('/').slice(2).join('/'); // Remove '/storage/v1/object/public/' part
        
        // Delete file from storage
        const { error } = await supabase.storage
          .from('kyc-documents')
          .remove([filePath]);
          
        if (error) {
          console.error('Error deleting file:', error);
        }
      }
    } catch (error) {
      console.error('Error removing document:', error);
    }
    
    // Remove from local state
    setDocuments(prev => {
      const newDocs = { ...prev };
      delete newDocs[documentType];
      return newDocs;
    });
  };

  const handleSubmit = async () => {
    // Check if all required documents are uploaded
    const missingDocuments = documentTypes
      .filter(doc => doc.required)
      .filter(doc => !documents[doc.id]);
    
    if (missingDocuments.length > 0) {
      const missingNames = missingDocuments.map(doc => doc.name).join(', ');
      alert(`Please upload all required documents. Missing: ${missingNames}`);
      return;
    }
    
    // Save documents to database
    try {
      const documentEntries = Object.values(documents);
      
      // Insert all documents to the database
      for (const doc of documentEntries) {
        if (doc.user_id && doc.document_type) {
          const { error } = await supabase
            .from('kyc_documents')
            .upsert(doc, {
              onConflict: 'user_id,document_type'
            });
            
          if (error) {
            console.error('Error saving document to database:', error);
            throw error;
          }
        }
      }
      
      onSubmit({ documents });
    } catch (error) {
      console.error('Error saving documents:', error);
      alert('Failed to save documents. Please try again.');
    }
  };

  const isRequiredDocumentsUploaded = () => {
    return documentTypes
      .filter(doc => doc.required)
      .every(doc => documents[doc.id]);
  };

  return (
    <div>
      <div className="mb-8 text-center">
        <div className="mx-auto h-16 w-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center mb-4">
          <File className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">KYC Documentation</h2>
        <p className="text-gray-600">Upload required documents for account verification</p>
      </div>

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
              {documents[docType.id] && (
                <div className="flex items-center text-green-600">
                  <Check className="h-4 w-4 mr-1" />
                  <span className="text-sm">Uploaded</span>
                </div>
              )}
            </div>

            {errors[docType.id] && (
              <div className="mb-4 flex items-center text-red-600">
                <AlertCircle className="h-4 w-4 mr-2" />
                <span className="text-sm">{errors[docType.id]}</span>
              </div>
            )}

            {documents[docType.id] ? (
              <div className="flex items-center justify-between bg-green-50 p-4 rounded-lg">
                <div className="flex items-center space-x-3">
                  <File className="h-8 w-8 text-green-600" />
                  <div>
                    <p className="text-sm font-medium text-green-900">
                      {documents[docType.id]?.file_name}
                    </p>
                    <p className="text-xs text-green-600">
                      {documents[docType.id]?.file_size ? `${((documents[docType.id]?.file_size || 0) / 1024).toFixed(1)} KB` : 'File uploaded'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeDocument(docType.id)}
                  className="text-red-600 hover:text-red-700 p-1"
                  disabled={uploading[docType.id]}
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
                      handleFileUpload(docType.id, file);
                    }
                  }}
                  className="hidden"
                  id={`upload-${docType.id}`}
                  disabled={uploading[docType.id]}
                />
                <label
                  htmlFor={`upload-${docType.id}`}
                  className={`inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors ${
                    uploading[docType.id] ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {uploading[docType.id] ? 'Uploading...' : 'Choose File'}
                </label>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-8 flex justify-between">
        <button
          onClick={onBack}
          className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-all"
          disabled={loading}
        >
          Back
        </button>
        <button
          onClick={handleSubmit}
          disabled={loading || !isRequiredDocumentsUploaded()}
          className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {loading ? 'Saving...' : 'Continue'}
        </button>
      </div>
    </div>
  );
}