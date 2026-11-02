import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { DocumentRecord } from '../../types';
import { formatDate } from '../../utils/formatters';
import {
  FolderLock,
  FileText,
  UploadCloud,
  Download,
  Trash2,
  Search,
  Filter,
  CheckCircle,
  FileCheck,
  Tag,
  Shield,
  Eye,
  Plus
} from 'lucide-react';

export const DocumentsView: React.FC = () => {
  const { documents, clients, currentUser, addDocument, deleteDocument, logAuditEvent } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [clientFilter, setClientFilter] = useState<string>('all');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  // New document form state
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<DocumentRecord['category']>('Wealth Report');
  const [newClientId, setNewClientId] = useState(clients[0]?.id || '');
  const [newFileName, setNewFileName] = useState('');
  const [newFileSize, setNewFileSize] = useState('1.8 MB');

  const isClient = currentUser?.role?.toLowerCase() === 'client';
  const userClientId = currentUser?.assignedClientId || currentUser?.clientId;

  const filteredDocs = documents.filter(doc => {
    const docClientId = doc.associatedClientId || doc.clientId;
    if (isClient && userClientId && docClientId !== userClientId) {
      return false;
    }
    if (clientFilter !== 'all' && docClientId !== clientFilter) {
      return false;
    }
    if (categoryFilter !== 'all' && doc.category !== categoryFilter) {
      return false;
    }
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const docTitle = (doc.name || doc.title || '').toLowerCase();
      const docFile = (doc.fileName || '').toLowerCase();
      const clientName = (clients.find(c => c.id === docClientId)?.name || '').toLowerCase();
      return docTitle.includes(q) || docFile.includes(q) || clientName.includes(q);
    }
    return true;
  });

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newClientId) return;

    const fileToUse = newFileName.trim() || `${newTitle.toLowerCase().replace(/\s+/g, '_')}.pdf`;

    const newDoc: Partial<DocumentRecord> = {
      name: newTitle.trim(),
      title: newTitle.trim(),
      category: newCategory,
      associatedClientId: newClientId,
      clientId: newClientId,
      fileName: fileToUse,
      fileSize: newFileSize,
      fileSizeBytes: 1800000,
      fileType: 'application/pdf',
      uploadDate: new Date().toISOString().split('T')[0],
      uploadedBy: currentUser?.name || 'Tanaisha Udwadia',
      isConfidential: true
    };

    addDocument(newDoc);
    setIsUploadModalOpen(false);
    setNewTitle('');
    setNewFileName('');
  };

  const handleDownloadSimulated = (doc: DocumentRecord) => {
    const docTitle = doc.title || doc.name || 'Document';
    const docFile = doc.fileName || `${docTitle.toLowerCase().replace(/\s+/g, '_')}.pdf`;
    logAuditEvent('export_run', 'document', doc.id, `Downloaded fiduciary document "${docTitle}" (${docFile})`);
    const blob = new Blob([`CapitalVest Fiduciary Document: ${docTitle}\nClient: ${doc.associatedClientName || doc.clientId || ''}\nUploaded: ${doc.uploadDate || doc.uploadedAt || ''}\nChecksum: SHA-256 Validated`], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = docFile;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-800 border border-indigo-200">
              <FolderLock className="w-3.5 h-3.5" /> Fiduciary Document Vault
            </span>
            <span className="text-xs text-slate-400">Encrypted AES-256 at Rest</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900">
            Document Repository & Compliance Vault
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Manage KYC packs, tax disclosures, signed investment policy statements, and quarterly audit reviews.
          </p>
        </div>

        {!isClient && (
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold transition-all shadow-md hover:shadow-lg"
          >
            <UploadCloud className="w-4 h-4 text-amber-400" />
            Upload Document
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center gap-4 justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search documents by title or file name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {!isClient && (
            <select
              value={clientFilter}
              onChange={(e) => setClientFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 bg-white"
            >
              <option value="all">All Clients</option>
              {clients.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          )}

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 bg-white"
          >
            <option value="all">All Document Types</option>
            <option value="portfolio_statement">Portfolio Statements</option>
            <option value="kyc_document">KYC & Compliance</option>
            <option value="tax_report">Tax & Capital Gains</option>
            <option value="advisory_agreement">Advisory Agreements</option>
            <option value="meeting_notes">Review Notes</option>
          </select>
        </div>
      </div>

      {/* Document List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {filteredDocs.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-slate-800">No documents found</h3>
            <p className="text-xs text-slate-500 mt-1">Adjust your filters or upload a new record to the vault.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 text-xs uppercase font-semibold">
                  <th className="py-3.5 px-6">Document Title</th>
                  <th className="py-3.5 px-4">Client Dossier</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Size & Format</th>
                  <th className="py-3.5 px-4">Date Uploaded</th>
                  <th className="py-3.5 px-4">Uploaded By</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredDocs.map((doc) => {
                  const targetClientId = doc.associatedClientId || doc.clientId;
                  const client = clients.find(c => c.id === targetClientId);
                  const docTitle = doc.title || doc.name || 'Document';
                  const docFile = doc.fileName || `${docTitle.toLowerCase().replace(/\s+/g, '_')}.pdf`;
                  const docSize = doc.fileSize || `${Math.round((doc.fileSizeBytes || 500000) / 1024)} KB`;
                  const uploadDate = doc.uploadDate || doc.uploadedAt || new Date().toISOString();
                  return (
                    <tr key={doc.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-amber-50 text-amber-800 border border-amber-200/60">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900">{docTitle}</div>
                            <div className="text-xs text-slate-500 font-mono">{docFile}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-xs font-medium text-slate-800">
                        {client?.name || doc.associatedClientName || 'Firm Archive'}
                      </td>
                      <td className="py-4 px-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700 capitalize">
                          {String(doc.category).replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-xs text-slate-600">
                        {docSize} • {doc.fileType.includes('pdf') ? 'PDF' : 'DOC'}
                      </td>
                      <td className="py-4 px-4 text-xs text-slate-600">
                        {formatDate(uploadDate)}
                      </td>
                      <td className="py-4 px-4 text-xs text-slate-600">
                        {doc.uploadedBy}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="inline-flex items-center gap-2">
                          <button
                            onClick={() => handleDownloadSimulated(doc)}
                            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                            title="Download verified document"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          {!isClient && (
                            <button
                              onClick={() => deleteDocument(doc.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              title="Delete record"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <UploadCloud className="w-5 h-5 text-amber-500" />
                <h3 className="font-bold text-slate-900 text-lg">Upload to Fiduciary Vault</h3>
              </div>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Document Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. FY 2024-25 Form 16 & Capital Gains"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Select Client Dossier *</label>
                <select
                  value={newClientId}
                  onChange={(e) => setNewClientId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                >
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.clientNumber || c.panNumber || c.id})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as DocumentRecord['category'])}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500 bg-white"
                  >
                    <option value="portfolio_statement">Portfolio Statement</option>
                    <option value="kyc_document">KYC Document</option>
                    <option value="tax_report">Tax & Capital Gains</option>
                    <option value="advisory_agreement">Advisory Agreement</option>
                    <option value="meeting_notes">Review Notes</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Simulated File Name</label>
                  <input
                    type="text"
                    placeholder="e.g. statement_q3.pdf"
                    value={newFileName}
                    onChange={(e) => setNewFileName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="p-4 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 text-center">
                <UploadCloud className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-xs text-slate-600 font-medium">Drag & drop encrypted PDF, DOCX, or Excel scan</p>
                <p className="text-[11px] text-slate-400 mt-1">Maximum 50MB per file • Anti-tamper digest calculated on upload</p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold transition-all shadow-md"
                >
                  Save to Vault
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
