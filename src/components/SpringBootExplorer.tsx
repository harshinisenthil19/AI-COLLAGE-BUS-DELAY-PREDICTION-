import React, { useState } from 'react';
import {
  Check,
  Code2,
  Copy,
  Database,
  Download,
  ExternalLink,
  FileCode,
  FolderGit2,
  Layers,
  Server,
  Terminal,
} from 'lucide-react';
import { SPRING_BOOT_PROJECT_FILES, SpringBootFile } from '../data/springBootCode';

export const SpringBootExplorer: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<SpringBootFile>(SPRING_BOOT_PROJECT_FILES[3]); // DelayPredictionService.java
  const [copied, setCopied] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('ALL');

  const handleCopyCode = () => {
    navigator.clipboard.writeText(selectedFile.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadFile = () => {
    const element = document.createElement('a');
    const file = new Blob([selectedFile.code], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = selectedFile.name;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const categories = ['ALL', 'SERVICE', 'CONTROLLER', 'ENTITY', 'SQL', 'CONFIG'];

  const filteredFiles = SPRING_BOOT_PROJECT_FILES.filter((f) => {
    if (activeCategory === 'ALL') return true;
    return f.category === activeCategory;
  });

  const apiEndpoints = [
    { method: 'POST', path: '/api/v1/auth/login', role: 'PUBLIC', desc: 'Authenticate student, driver or admin with JWT token' },
    { method: 'GET', path: '/api/v1/buses', role: 'ALL', desc: 'Retrieve full fleet list with real-time location telemetry' },
    { method: 'GET', path: '/api/v1/buses/{id}', role: 'ALL', desc: 'Get single bus details, passenger load and assigned driver' },
    { method: 'GET', path: '/api/v1/buses/{id}/prediction', role: 'ALL', desc: 'Trigger AI delay regression and classification inference' },
    { method: 'PUT', path: '/api/v1/buses/{id}/location', role: 'DRIVER, ADMIN', desc: 'Stream GPS coordinates, speed, and current stop index' },
    { method: 'POST', path: '/api/v1/buses/{id}/incidents', role: 'DRIVER', desc: 'Report road block, traffic choke, or mechanical delay' },
    { method: 'POST', path: '/api/v1/admin/buses', role: 'ADMIN', desc: 'Provision and register new bus in campus fleet' },
    { method: 'POST', path: '/api/v1/admin/routes', role: 'ADMIN', desc: 'Add new corridor route with waypoint stops and distances' },
    { method: 'GET', path: '/api/v1/reports/fleet-delays', role: 'ADMIN', desc: 'Generate 30-day historical delay validation report' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs px-2 py-0.5 rounded bg-sky-500/20 text-sky-400 font-mono font-medium">
              BACKEND ARCHITECTURE
            </span>
            <span className="text-xs text-slate-400">· Java 17 + Spring Boot 3.2.4 + MySQL 8.0</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">Java Spring Boot & MySQL Full-Stack Hub</h2>
          <p className="text-xs text-slate-400">
            Complete production-ready Spring Boot backend codebase, JPA entities, REST controllers, MySQL DDL schema, and ML regression services.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadFile}
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-750 text-slate-200 border border-slate-700 text-xs font-semibold transition-colors flex items-center gap-2"
          >
            <Download className="w-3.5 h-3.5 text-amber-400" />
            <span>Download {selectedFile.name}</span>
          </button>
        </div>
      </div>

      {/* Code Browser Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Sidebar: File Tree */}
        <div className="rounded-2xl bg-slate-850 border border-slate-700/80 p-4 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-700">
            <span className="text-xs font-semibold text-white flex items-center gap-1.5">
              <FolderGit2 className="w-4 h-4 text-amber-400" /> Project Structure
            </span>
            <span className="text-[10px] text-slate-400 font-mono">{filteredFiles.length} files</span>
          </div>

          {/* Category Filter Chips */}
          <div className="flex flex-wrap gap-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-2 py-0.5 text-[10px] font-mono rounded transition-colors ${
                  activeCategory === cat
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* File List */}
          <div className="space-y-1 max-h-[500px] overflow-y-auto pr-1">
            {filteredFiles.map((file) => {
              const isSelected = selectedFile.name === file.name;
              return (
                <button
                  key={file.name}
                  onClick={() => setSelectedFile(file)}
                  className={`w-full text-left p-2.5 rounded-xl text-xs transition-colors flex items-start gap-2.5 ${
                    isSelected
                      ? 'bg-amber-500/15 border border-amber-500/40 text-amber-300'
                      : 'hover:bg-slate-800 text-slate-300'
                  }`}
                >
                  <FileCode className={`w-4 h-4 shrink-0 mt-0.5 ${isSelected ? 'text-amber-400' : 'text-slate-500'}`} />
                  <div className="truncate">
                    <span className="font-semibold block truncate">{file.name}</span>
                    <span className="text-[10px] text-slate-500 font-mono block truncate">{file.path}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Code Viewer Window */}
        <div className="lg:col-span-3 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col overflow-hidden shadow-2xl">
          {/* Editor Header Bar */}
          <div className="px-5 py-3 bg-slate-850 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white font-mono">{selectedFile.name}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-700 text-slate-300 font-mono uppercase">
                  {selectedFile.language}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">{selectedFile.description}</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyCode}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition-colors flex items-center gap-1.5"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                <span>{copied ? 'Copied to Clipboard!' : 'Copy Code'}</span>
              </button>
            </div>
          </div>

          {/* Syntax Highlighted Code Viewer */}
          <div className="p-4 overflow-x-auto bg-slate-950 flex-1 max-h-[550px] font-mono text-xs leading-relaxed text-slate-300">
            <pre className="whitespace-pre">
              <code>{selectedFile.code}</code>
            </pre>
          </div>
        </div>
      </div>

      {/* REST API Endpoints Reference Table */}
      <div className="rounded-2xl bg-slate-850 border border-slate-700/80 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Server className="w-4 h-4 text-amber-400" />
              <span>Spring Boot REST API Endpoint Matrix</span>
            </h3>
            <p className="text-xs text-slate-400">Complete API contracts supporting the React transit client</p>
          </div>
          <span className="text-xs text-slate-400 font-mono">Base URL: http://localhost:8080</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-700 text-slate-400 font-medium">
                <th className="py-2.5 px-3">Method</th>
                <th className="py-2.5 px-3">Endpoint Path</th>
                <th className="py-2.5 px-3">Access Security Role</th>
                <th className="py-2.5 px-3">Functionality Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 font-mono">
              {apiEndpoints.map((ep, idx) => (
                <tr key={idx} className="hover:bg-slate-800/40">
                  <td className="py-2.5 px-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        ep.method === 'GET'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : ep.method === 'POST'
                          ? 'bg-amber-500/20 text-amber-400'
                          : ep.method === 'PUT'
                          ? 'bg-sky-500/20 text-sky-400'
                          : 'bg-rose-500/20 text-rose-400'
                      }`}
                    >
                      {ep.method}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-200">{ep.path}</td>
                  <td className="py-2.5 px-3 text-slate-400 text-[11px] font-sans">{ep.role}</td>
                  <td className="py-2.5 px-3 text-slate-300 font-sans text-xs">{ep.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Setup & Run Commands Box */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-4">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <Terminal className="w-4 h-4 text-emerald-400" />
          <span>Local Deployment Commands</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <span className="text-slate-400 font-sans font-semibold block">1. Run MySQL & Seed Database:</span>
            <div className="text-slate-300">
              <span className="text-amber-400">$</span> mysql -u root -p &lt; schema.sql
            </div>
            <p className="text-[11px] text-slate-500 font-sans">
              Creates college_transit_db with all tables and sample routes.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <span className="text-slate-400 font-sans font-semibold block">2. Run Spring Boot Backend:</span>
            <div className="text-slate-300">
              <span className="text-amber-400">$</span> mvn clean spring-boot:run
            </div>
            <p className="text-[11px] text-slate-500 font-sans">
              Starts REST APIs with Tomcat on port 8080.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
