'use client';

import { useState } from 'react';
import Topbar from '@/components/layout/Topbar';
import {
  Plus,
  Search,
  Package,
  ArrowRightLeft,
  ScanLine,
  Tag,
  Eye,
  Edit,
  CheckCircle,
  AlertCircle,
  Camera,
} from 'lucide-react';
import UploadAssetDialog from '@/components/modules/apple/UploadAssetDialog';
import AssetMovementDialog from '@/components/modules/apple/AssetMovementDialog';

// Mock data
const mockAssets = [
  { id: '1', name: '投影機 EP-01', code: 'IT-2025-001', category: 'equipment', location: '301 課室', status: 'normal', purchase_date: '2024-03-15', value: 8500 },
  { id: '2', name: '辦公桌', code: 'FR-2025-001', category: 'furniture', location: '校長室', status: 'normal', purchase_date: '2023-09-01', value: 3200 },
  { id: '3', name: '打印機 HP LaserJet', code: 'IT-2025-002', category: 'equipment', location: '文印室', status: 'maintenance', purchase_date: '2024-01-10', value: 5600 },
  { id: '4', name: '課室冷氣機', code: 'AC-2025-001', category: 'equipment', location: '201 課室', status: 'normal', purchase_date: '2024-06-20', value: 12000 },
  { id: '5', name: '會議室椅子 x 20', code: 'FR-2025-002', category: 'furniture', location: '會議室', status: 'normal', purchase_date: '2023-11-05', value: 8000 },
];

const mockMovements = [
  { id: '1', asset_code: 'IT-2025-001', asset_name: '投影機 EP-01', from_location: '301 課室', to_location: '禮堂', move_date: '2025-09-15', moved_by: '張主任' },
  { id: '2', asset_code: 'FR-2025-002', asset_name: '會議室椅子 x 20', from_location: '會議室', to_location: '活動室', move_date: '2025-09-20', moved_by: '李職員' },
];

const mockStocktakes = [
  { id: '1', name: '2025年度資產盤點', date: '2025-09-01', status: 'completed', total: 45, checked: 45, missing: 0 },
  { id: '2', name: 'IT設備季度核查', date: '2025-10-01', status: 'in_progress', total: 28, checked: 15, missing: 0 },
];

const categories = [
  { value: 'equipment', label: '設備' },
  { value: 'furniture', label: '傢俱' },
  { value: 'vehicle', label: '車輛' },
  { value: 'building', label: '建築物' },
  { value: 'other', label: '其他' },
];

export default function AssetsPage() {
  const [activeTab, setActiveTab] = useState<'list' | 'movements' | 'stocktake'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAssetDialog, setShowAssetDialog] = useState(false);
  const [showUploadAssetDialog, setShowUploadAssetDialog] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<{ id: string; name: string; currentLocation: string } | null>(null);

  const filteredAssets = mockAssets.filter((asset) =>
    asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    asset.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('zh-HK', {
      style: 'currency',
      currency: 'HKD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <>
      <Topbar title="資產管理" />
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>資產概覽</h2>
            <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>管理學校資產、記錄移動和進行盤點</p>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:opacity-80"
              style={{ borderColor: 'var(--border)', backgroundColor: 'var(--panel)', color: 'var(--text)' }}>
              <Tag className="w-4 h-4" />
              列印標籤
            </button>
            <button
              onClick={() => setShowUploadAssetDialog(true)}
              className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:opacity-80"
              style={{ borderColor: 'var(--border)', backgroundColor: 'var(--panel)', color: 'var(--text)' }}
            >
              <Camera className="w-4 h-4" />
              OCR 識別
            </button>
            <button
              onClick={() => setShowAssetDialog(true)}
              className="flex items-center gap-2 px-4 py-2 text-white rounded-lg hover:opacity-90"
              style={{ backgroundColor: 'var(--brand)' }}
            >
              <Plus className="w-4 h-4" />
              新增資產
            </button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => setActiveTab('list')}
            className="p-4 rounded-lg border transition-colors"
            style={{
              borderColor: activeTab === 'list' ? 'var(--brand)' : 'var(--border)',
              backgroundColor: activeTab === 'list' ? 'var(--brand-light)' : 'var(--panel)',
              color: 'var(--text)',
            }}
          >
            <Package className="w-6 h-6 mb-2" style={{ color: activeTab === 'list' ? 'var(--brand)' : 'var(--muted)' }} />
            <p className="font-medium">資產列表</p>
            <p className="text-sm" style={{ color: 'var(--muted)' }}>{mockAssets.length} 件資產</p>
          </button>
          <button
            onClick={() => setActiveTab('movements')}
            className="p-4 rounded-lg border transition-colors"
            style={{
              borderColor: activeTab === 'movements' ? 'var(--brand)' : 'var(--border)',
              backgroundColor: activeTab === 'movements' ? 'var(--brand-light)' : 'var(--panel)',
              color: 'var(--text)',
            }}
          >
            <ArrowRightLeft className="w-6 h-6 mb-2" style={{ color: activeTab === 'movements' ? 'var(--brand)' : 'var(--muted)' }} />
            <p className="font-medium">移動記錄</p>
            <p className="text-sm" style={{ color: 'var(--muted)' }}>{mockMovements.length} 條記錄</p>
          </button>
          <button
            onClick={() => setActiveTab('stocktake')}
            className="p-4 rounded-lg border transition-colors"
            style={{
              borderColor: activeTab === 'stocktake' ? 'var(--brand)' : 'var(--border)',
              backgroundColor: activeTab === 'stocktake' ? 'var(--brand-light)' : 'var(--panel)',
              color: 'var(--text)',
            }}
          >
            <ScanLine className="w-6 h-6 mb-2" style={{ color: activeTab === 'stocktake' ? 'var(--brand)' : 'var(--muted)' }} />
            <p className="font-medium">庫存盤點</p>
            <p className="text-sm" style={{ color: 'var(--muted)' }}>{mockStocktakes.length} 個任務</p>
          </button>
        </div>

        {/* Content */}
        <div className="rounded-lg" style={{ backgroundColor: 'var(--panel)', borderWidth: '1px', borderColor: 'var(--border)' }}>
          {activeTab === 'list' && (
            <div className="p-6">
              <div className="mb-4">
                <div className="relative max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--muted)' }} />
                  <input
                    type="search"
                    placeholder="搜索資產名稱或編號..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 border rounded-md"
                    style={{ borderColor: 'var(--border)', backgroundColor: 'var(--panel-soft)', color: 'var(--text)' }}
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead style={{ backgroundColor: 'var(--panel-soft)' }}>
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase" style={{ color: 'var(--muted)' }}>編號</th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase" style={{ color: 'var(--muted)' }}>名稱</th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase" style={{ color: 'var(--muted)' }}>類別</th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase" style={{ color: 'var(--muted)' }}>位置</th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase" style={{ color: 'var(--muted)' }}>狀態</th>
                      <th className="px-4 py-3 text-right text-xs font-medium uppercase" style={{ color: 'var(--muted)' }}>操作</th>
                    </tr>
                  </thead>
                  <tbody style={{ borderTopWidth: '1px', borderColor: 'var(--border)' }}>
                    {filteredAssets.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-12 text-center" style={{ color: 'var(--muted)' }}>
                          暫無資產記錄
                        </td>
                      </tr>
                    ) : (
                      filteredAssets.map((asset) => (
                        <tr key={asset.id} className="hover:opacity-80" style={{ borderBottomWidth: '1px', borderColor: 'var(--border)' }}>
                          <td className="px-4 py-3 text-sm font-mono" style={{ color: 'var(--text)' }}>{asset.code}</td>
                          <td className="px-4 py-3 text-sm font-medium" style={{ color: 'var(--text)' }}>{asset.name}</td>
                          <td className="px-4 py-3 text-sm" style={{ color: 'var(--muted)' }}>
                            {categories.find((c) => c.value === asset.category)?.label}
                          </td>
                          <td className="px-4 py-3 text-sm" style={{ color: 'var(--muted)' }}>{asset.location}</td>
                          <td className="px-4 py-3">
                            <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full"
                              style={{ backgroundColor: asset.status === 'normal' ? 'var(--good-bg)' : 'var(--warning-bg)', color: asset.status === 'normal' ? 'var(--good)' : 'var(--warning)' }}>
                              {asset.status === 'normal' ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                              {asset.status === 'normal' ? '正常' : '維修中'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button className="p-1.5 rounded hover:opacity-70" style={{ color: 'var(--brand)' }}>
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setSelectedAsset({ id: asset.id, name: asset.name, currentLocation: asset.location })}
                                className="p-1.5 rounded hover:opacity-70"
                                style={{ color: 'var(--brand)' }}
                              >
                                <ArrowRightLeft className="w-4 h-4" />
                              </button>
                              <button className="p-1.5 rounded hover:opacity-70" style={{ color: 'var(--brand)' }}>
                                <Edit className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'movements' && (
            <div className="p-6">
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead style={{ backgroundColor: 'var(--panel-soft)' }}>
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase" style={{ color: 'var(--muted)' }}>日期</th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase" style={{ color: 'var(--muted)' }}>資產</th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase" style={{ color: 'var(--muted)' }}>從</th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase" style={{ color: 'var(--muted)' }}>至</th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase" style={{ color: 'var(--muted)' }}>負責人</th>
                    </tr>
                  </thead>
                  <tbody style={{ borderTopWidth: '1px', borderColor: 'var(--border)' }}>
                    {mockMovements.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-12 text-center" style={{ color: 'var(--muted)' }}>
                          暫無移動記錄
                        </td>
                      </tr>
                    ) : (
                      mockMovements.map((move) => (
                        <tr key={move.id} className="hover:opacity-80" style={{ borderBottomWidth: '1px', borderColor: 'var(--border)' }}>
                          <td className="px-4 py-3 text-sm" style={{ color: 'var(--text)' }}>{move.move_date}</td>
                          <td className="px-4 py-3">
                            <div className="text-sm font-medium" style={{ color: 'var(--text)' }}>{move.asset_name}</div>
                            <div className="text-xs" style={{ color: 'var(--muted)' }}>{move.asset_code}</div>
                          </td>
                          <td className="px-4 py-3 text-sm" style={{ color: 'var(--muted)' }}>{move.from_location}</td>
                          <td className="px-4 py-3 text-sm" style={{ color: 'var(--muted)' }}>{move.to_location}</td>
                          <td className="px-4 py-3 text-sm" style={{ color: 'var(--muted)' }}>{move.moved_by}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'stocktake' && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold" style={{ color: 'var(--text)' }}>盤點任務</h3>
                <button className="flex items-center gap-2 px-4 py-2 text-white rounded-lg hover:opacity-90"
                  style={{ backgroundColor: 'var(--brand)' }}>
                  <ScanLine className="w-4 h-4" />
                  開始新盤點
                </button>
              </div>
              <div className="space-y-4">
                {mockStocktakes.map((task) => (
                  <div key={task.id} className="rounded-lg p-4" style={{ borderWidth: '1px', borderColor: 'var(--border)' }}>
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-medium" style={{ color: 'var(--text)' }}>{task.name}</h4>
                        <p className="text-sm" style={{ color: 'var(--muted)' }}>{task.date}</p>
                      </div>
                      <span className="px-2 py-1 text-xs font-medium rounded-full"
                        style={{ backgroundColor: task.status === 'completed' ? 'var(--good-bg)' : 'var(--info-bg)', color: task.status === 'completed' ? 'var(--good)' : 'var(--info)' }}>
                        {task.status === 'completed' ? '已完成' : '進行中'}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--border)' }}>
                          <div
                            className="h-full rounded-full"
                            style={{ width: `${(task.checked / task.total) * 100}%`, backgroundColor: 'var(--brand)' }}
                          />
                        </div>
                      </div>
                      <span className="text-sm" style={{ color: 'var(--muted)' }}>
                        {task.checked} / {task.total}
                      </span>
                      {task.status === 'completed' && task.missing === 0 && (
                        <span className="flex items-center gap-1 text-sm" style={{ color: 'var(--good)' }}>
                          <CheckCircle className="w-4 h-4" />
                          全部完成
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Asset Dialog */}
      {showAssetDialog && (
        <AssetDialog onClose={() => setShowAssetDialog(false)} />
      )}

      {/* Upload Asset Dialog */}
      <UploadAssetDialog
        isOpen={showUploadAssetDialog}
        onClose={() => setShowUploadAssetDialog(false)}
        onSubmit={(data) => {
          alert(`已識別：資產 ${data.name}，價值 HK$${data.value}`);
          setShowUploadAssetDialog(false);
        }}
      />

      {/* Asset Movement Dialog */}
      <AssetMovementDialog
        isOpen={!!selectedAsset}
        onClose={() => setSelectedAsset(null)}
        asset={selectedAsset}
        onSubmit={(data) => {
          alert(`資產已從 ${data.from_location} 搬移到 ${data.to_location}`);
          setSelectedAsset(null);
        }}
      />
    </>
  );
}

function AssetDialog({ onClose }: { onClose: () => void }) {
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    category: 'equipment',
    location: '',
    purchase_date: '',
    value: '',
  });

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('資產已添加');
    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="rounded-lg w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto" style={{ backgroundColor: 'var(--panel)' }}>
        <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text)' }}>新增資產</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text)' }}>資產名稱</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              style={inputStyle}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text)' }}>資產編號</label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                style={inputStyle}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text)' }}>類別</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                style={inputStyle}
              >
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text)' }}>位置</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                style={inputStyle}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text)' }}>購置日期</label>
              <input
                type="date"
                value={formData.purchase_date}
                onChange={(e) => setFormData({ ...formData, purchase_date: e.target.value })}
                style={inputStyle}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text)' }}>價值 (HKD)</label>
            <input
              type="number"
              value={formData.value}
              onChange={(e) => setFormData({ ...formData, value: e.target.value })}
              style={inputStyle}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-md hover:opacity-80"
              style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
            >
              取消
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-white rounded-md hover:opacity-90"
              style={{ backgroundColor: 'var(--brand)' }}
            >
              保存
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
