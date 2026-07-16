'use client';

import { useState } from 'react';
import Topbar from '@/components/layout/Topbar';
import Link from 'next/link';
import { ArrowLeft, FileText, Download, Eye, Check, X } from 'lucide-react';

// Common input style using CSS variables
const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '8px 12px',
  borderWidth: '1px',
  borderStyle: 'solid',
  borderColor: 'var(--border)',
  borderRadius: '6px',
  backgroundColor: 'var(--panel)',
  color: 'var(--text)',
  outline: 'none',
};

// Mock students data
const mockStudents = [
  { id: '1', name: '陳小明', class: '1A', student_no: '2025001' },
  { id: '2', name: '李美美', class: '1A', student_no: '2025002' },
  { id: '3', name: '張大文', class: '1B', student_no: '2025003' },
  { id: '4', name: '王小红', class: '1B', student_no: '2025004' },
  { id: '5', name: '劉志偉', class: '2A', student_no: '2024001' },
  { id: '6', name: '黃淑芬', class: '2A', student_no: '2024002' },
  { id: '7', name: '周杰倫', class: '2B', student_no: '2024003' },
  { id: '8', name: '吳依琳', class: '3A', student_no: '2023001' },
  { id: '9', name: '孫雅琪', class: '3A', student_no: '2023002' },
  { id: '10', name: '鄭宇翔', class: '3B', student_no: '2023003' },
];

const awardOptions = [
  { value: '學業優異獎', label: '學業優異獎', amount: 'HK$1,000' },
  { value: '品行優良獎', label: '品行優良獎', amount: 'HK$500' },
  { value: '服務精神獎', label: '服務精神獎', amount: 'HK$500' },
  { value: '體育優異獎', label: '體育優異獎', amount: 'HK$300' },
  { value: '藝術成就獎', label: '藝術成就獎', amount: 'HK$300' },
];

export default function GenerateCertificatesPage() {
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [awardName, setAwardName] = useState('學業優異獎');
  const [ceremonyDate, setCeremonyDate] = useState(new Date().toISOString().split('T')[0]);
  const [signatory, setSignatory] = useState('陳校長');
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [previewStudent, setPreviewStudent] = useState<typeof mockStudents[0] | null>(null);

  const selectedAward = awardOptions.find((a) => a.value === awardName);

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(mockStudents.map((s) => s.id));
    }
    setSelectAll(!selectAll);
  };

  const handleSelectStudent = (id: string) => {
    if (selectedStudents.includes(id)) {
      setSelectedStudents(selectedStudents.filter((s) => s !== id));
    } else {
      setSelectedStudents([...selectedStudents, id]);
    }
  };

  // Generate single certificate HTML
  const generateCertificateHTML = (student: typeof mockStudents[0]) => {
    const year = new Date(ceremonyDate).getFullYear();
    const month = new Date(ceremonyDate).getMonth() + 1;
    const day = new Date(ceremonyDate).getDate();
    const formattedDate = `${year}年${month}月${day}日`;

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>獎狀 - ${student.name}</title>
  <style>
    @page {
      size: A4 landscape;
      margin: 0;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'DFKai-SB', 'BiauKai', '標楷體', KaiTi, serif;
      width: 297mm;
      height: 210mm;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #fff;
    }
    .certificate {
      width: 260mm;
      height: 180mm;
      border: 8px double #c9a227;
      padding: 15mm;
      position: relative;
      background: linear-gradient(135deg, #fffef5 0%, #fff9e6 100%);
    }
    .border-decoration {
      position: absolute;
      top: 5mm;
      left: 5mm;
      right: 5mm;
      bottom: 5mm;
      border: 2px solid #c9a227;
      pointer-events: none;
    }
    .corner {
      position: absolute;
      width: 15px;
      height: 15px;
      border: 2px solid #c9a227;
    }
    .corner-tl { top: -2px; left: -2px; border-right: none; border-bottom: none; }
    .corner-tr { top: -2px; right: -2px; border-left: none; border-bottom: none; }
    .corner-bl { bottom: -2px; left: -2px; border-right: none; border-top: none; }
    .corner-br { bottom: -2px; right: -2px; border-left: none; border-top: none; }
    .school-name {
      text-align: center;
      font-size: 28px;
      font-weight: bold;
      color: #8b4513;
      margin-bottom: 8px;
      letter-spacing: 8px;
    }
    .title {
      text-align: center;
      font-size: 42px;
      font-weight: bold;
      color: #8b4513;
      margin-bottom: 15px;
      letter-spacing: 12px;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
    }
    .recipient {
      text-align: center;
      font-size: 24px;
      color: #333;
      margin-bottom: 8px;
    }
    .recipient-name {
      display: inline-block;
      font-size: 36px;
      font-weight: bold;
      color: #8b4513;
      padding: 5px 30px;
      border-bottom: 3px solid #c9a227;
      margin-bottom: 15px;
    }
    .award-text {
      text-align: center;
      font-size: 20px;
      color: #555;
      line-height: 1.8;
    }
    .award-name {
      font-size: 26px;
      font-weight: bold;
      color: #c9a227;
    }
    .footer {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-top: 20px;
      padding: 0 20px;
    }
    .date {
      font-size: 16px;
      color: #666;
    }
    .signature {
      text-align: right;
    }
    .signature-line {
      font-size: 18px;
      color: #333;
      margin-bottom: 5px;
    }
    .school-chop {
      width: 60px;
      height: 60px;
      border: 2px solid #c9a227;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      color: #c9a227;
      margin-top: 5px;
    }
    @media print {
      body { width: auto; height: auto; }
      .certificate { border: none; }
    }
  </style>
</head>
<body>
  <div class="certificate">
    <div class="border-decoration"></div>
    <div class="corner corner-tl"></div>
    <div class="corner corner-tr"></div>
    <div class="corner corner-bl"></div>
    <div class="corner corner-br"></div>
    
    <div class="school-name">香 港 培 英 中 學</div>
    <div class="title">獎　狀</div>
    
    <div class="recipient">
      茲授予
    </div>
    <div class="recipient-name">${student.name}</div>
    
    <div class="award-text">
      貴學生於本學年表現傑出，榮獲<br>
      「<span class="award-name">${awardName}</span>」<br>
      特此頒發獎狀，以資鼓勵。
    </div>
    
    <div class="footer">
      <div class="date">中華人民共和國香港特別行政區<br>${formattedDate}</div>
      <div class="signature">
        <div class="signature-line">香港培英中學校長</div>
        <div class="signature-line">${signatory}</div>
        <div class="school-chop">校印</div>
      </div>
    </div>
  </div>
</body>
</html>`;
  };

  const handleGenerate = () => {
    if (selectedStudents.length === 0) {
      alert('請選擇至少一名學生');
      return;
    }
    setGenerating(true);

    // Generate certificates and download as individual files
    const students = mockStudents.filter((s) => selectedStudents.includes(s.id));

    // For batch download, create a printable document with all certificates
    const allCertificates = students.map((student) => {
      return `
      <div style="page-break-after: always;">
        ${generateCertificateHTML(student)}
      </div>`;
    }).join('');

    const printContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>獎狀批量打印</title>
  <style>
    @page {
      size: A4 landscape;
      margin: 0;
    }
    body {
      font-family: 'DFKai-SB', 'BiauKai', '標楷體', KaiTi, serif;
    }
  </style>
</head>
<body>
  ${allCertificates}
</body>
</html>`;

    // Open print window with all certificates
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      setTimeout(() => {
        printWindow.print();
        setGenerating(false);
        setGenerated(true);
      }, 500);
    } else {
      setGenerating(false);
      alert('請允許彈出視窗以進行打印');
    }
  };

  const handleDownloadAll = () => {
    // Download each certificate as a separate HTML file
    const students = mockStudents.filter((s) => selectedStudents.includes(s.id));
    const zipName = `${awardName}_獎狀_${new Date().toISOString().split('T')[0]}`;

    // For simplicity, download the first certificate as a sample
    // In production, this would use a proper zip library
    const firstStudent = students[0];
    if (firstStudent) {
      const html = generateCertificateHTML(firstStudent);
      const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `獎狀_${firstStudent.name}_${firstStudent.student_no}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
    }
  };

  const handlePreview = (studentId: string) => {
    const student = mockStudents.find((s) => s.id === studentId);
    if (student) {
      setPreviewStudent(student);
    }
  };

  const handlePrintCertificate = () => {
    if (previewStudent) {
      const html = generateCertificateHTML(previewStudent);
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(html);
        printWindow.document.close();
        setTimeout(() => {
          printWindow.print();
        }, 500);
      }
    }
  };

  return (
    <>
      <Topbar title="生成獎狀" />
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard/apple/awards"
              className="p-2 rounded-md hover:opacity-70"
              style={{ color: 'var(--muted)' }}
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h2 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>批量生成獎狀</h2>
              <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>選擇學生並批量生成獎狀 PDF</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleGenerate}
              disabled={selectedStudents.length === 0 || generating}
              className="flex items-center gap-2 px-4 py-2 rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: 'var(--brand)', color: 'var(--panel)' }}
            >
              <FileText className="w-4 h-4" />
              {generating ? '生成中...' : '生成 PDF'}
            </button>
          </div>
        </div>

        {/* Award Info Form */}
        <div className="rounded-lg p-4" style={{ backgroundColor: 'var(--panel)', borderWidth: '1px', borderColor: 'var(--border)' }}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text)' }}>
                獎項名稱
              </label>
              <select
                value={awardName}
                onChange={(e) => setAwardName(e.target.value)}
                style={inputStyle}
              >
                {awardOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label} ({option.amount})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text)' }}>
                頒獎日期
              </label>
              <input
                type="date"
                value={ceremonyDate}
                onChange={(e) => setCeremonyDate(e.target.value)}
                style={inputStyle}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text)' }}>
                校長/簽署人
              </label>
              <input
                type="text"
                value={signatory}
                onChange={(e) => setSignatory(e.target.value)}
                placeholder="陳校長"
                style={inputStyle}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text)' }}>
                已選擇
              </label>
              <div className="px-3 py-2 rounded-md text-center" style={{ backgroundColor: 'var(--panel-soft)', borderWidth: '1px', borderColor: 'var(--border)' }}>
                <span className="text-lg font-bold" style={{ color: 'var(--brand)' }}>{selectedStudents.length}</span>
                <span style={{ color: 'var(--muted)' }}> 名學生</span>
              </div>
            </div>
          </div>
        </div>

        {/* Generated Status */}
        {generated && (
          <div className="rounded-lg p-4 flex items-center justify-between" style={{ backgroundColor: 'var(--good-bg)', borderWidth: '1px', borderColor: 'var(--good)' }}>
            <div className="flex items-center gap-2" style={{ color: 'var(--good)' }}>
              <Check className="w-5 h-5" />
              <span>已成功生成 {selectedStudents.length} 份獎狀，請在打印窗口中選擇「另存為 PDF」</span>
            </div>
            <button
              onClick={handleDownloadAll}
              className="flex items-center gap-2 px-4 py-2 rounded-lg hover:opacity-90"
              style={{ backgroundColor: 'var(--good)', color: 'var(--panel)' }}
            >
              <Download className="w-4 h-4" />
              下載 HTML
            </button>
          </div>
        )}

        {/* Student List */}
        <div className="rounded-lg overflow-hidden" style={{ backgroundColor: 'var(--panel)', borderWidth: '1px', borderColor: 'var(--border)' }}>
          <div className="p-4" style={{ borderBottomWidth: '1px', borderColor: 'var(--border)', backgroundColor: 'var(--panel-soft)' }}>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectAll}
                onChange={handleSelectAll}
                className="w-4 h-4 rounded"
                style={{ accentColor: 'var(--brand)' }}
              />
              <span className="text-sm font-medium" style={{ color: 'var(--text)' }}>全選</span>
            </label>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead style={{ backgroundColor: 'var(--panel-soft)' }}>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider w-12" style={{ color: 'var(--muted)' }}>
                    選擇
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--muted)' }}>
                    學號
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--muted)' }}>
                    姓名
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--muted)' }}>
                    班別
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--muted)' }}>
                    操作
                  </th>
                </tr>
              </thead>
              <tbody style={{ borderTopWidth: '1px', borderColor: 'var(--border)' }}>
                {mockStudents.map((student) => (
                  <tr key={student.id} className="hover:opacity-80" style={{ borderBottomWidth: '1px', borderColor: 'var(--border)' }}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedStudents.includes(student.id)}
                        onChange={() => handleSelectStudent(student.id)}
                        className="w-4 h-4 rounded"
                        style={{ accentColor: 'var(--brand)' }}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: 'var(--text)' }}>
                      {student.student_no}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium" style={{ color: 'var(--text)' }}>
                      {student.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: 'var(--muted)' }}>
                      {student.class}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handlePreview(student.id)}
                        className="p-2 rounded hover:opacity-70"
                        style={{ color: 'var(--brand)' }}
                        title="預覽獎狀"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {previewStudent && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}
          onClick={() => setPreviewStudent(null)}
        >
          <div
            className="rounded-lg max-w-4xl max-h-[90vh] overflow-auto p-6"
            style={{ backgroundColor: 'var(--panel)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold" style={{ color: 'var(--text)' }}>
                獎狀預覽 - {previewStudent.name}
              </h3>
              <button
                onClick={() => setPreviewStudent(null)}
                className="p-2 rounded hover:opacity-70"
                style={{ color: 'var(--muted)' }}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Certificate Preview */}
            <div
              className="rounded-lg border-8 mx-auto mb-4"
              style={{
                borderColor: '#c9a227',
                borderStyle: 'double',
                background: 'linear-gradient(135deg, #fffef5 0%, #fff9e6 100%)',
                padding: '20px',
                maxWidth: '700px',
              }}
            >
              <div className="text-center mb-4">
                <div className="text-2xl font-bold tracking-widest" style={{ color: '#8b4513' }}>
                  香 港 培 英 中 學
                </div>
                <div className="text-4xl font-bold my-3 tracking-widest" style={{ color: '#8b4513' }}>
                  獎　狀
                </div>
              </div>

              <div className="text-center mb-4">
                <div className="text-lg mb-2">茲授予</div>
                <div className="text-3xl font-bold border-b-2 inline-block px-8 pb-1" style={{ borderColor: '#c9a227', color: '#8b4513' }}>
                  {previewStudent.name}
                </div>
              </div>

              <div className="text-center mb-6 leading-relaxed">
                <p>貴學生於本學年表現傑出，榮獲</p>
                <p className="text-2xl font-bold my-2" style={{ color: '#c9a227' }}>「{awardName}」</p>
                <p>特此頒發獎狀，以資鼓勵。</p>
              </div>

              <div className="flex justify-between items-end mt-6">
                <div className="text-sm">
                  <p>中華人民共和國香港特別行政區</p>
                  <p>{new Date(ceremonyDate).toLocaleDateString('zh-HK')}</p>
                </div>
                <div className="text-right">
                  <p>香港培英中學校長</p>
                  <p className="font-bold">{signatory}</p>
                  <div
                    className="w-12 h-12 rounded-full border-2 mx-auto mt-1 flex items-center justify-center text-xs"
                    style={{ borderColor: '#c9a227', color: '#c9a227' }}
                  >
                    校印
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-center gap-4">
              <button
                onClick={handlePrintCertificate}
                className="flex items-center gap-2 px-6 py-2 rounded-lg hover:opacity-90"
                style={{ backgroundColor: 'var(--brand)', color: 'var(--panel)' }}
              >
                <FileText className="w-4 h-4" />
                打印獎狀
              </button>
              <button
                onClick={() => setPreviewStudent(null)}
                className="px-6 py-2 rounded-lg border"
                style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
              >
                關閉
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
