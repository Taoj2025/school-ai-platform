'use client';

import { useState, useEffect, useCallback } from 'react';
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
import { api } from '@/lib/api';

const categories = [
  { value: 'equipment', label: '設備' },
  { value: 'furniture', label: '傢俱' },
  { value: 'vehicle', label: '車輛' },
  { value: 'building', label: '建築物' },
  { value: 'other', label: '其他' },
];

type Asset = {
  id: string;
  asset_code: string;
  name: string;
  category: string;
  location: string;
  status: string;
  current_value?: number;
  purchase_date?: string;
};

export default function AssetsPage() {
  const [activeTab, setActiveTab] = useState<'list' | 'movements' | 'stocktake'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAssetDialog, setShowAssetDialog] = useState(false);
  const [showUploadAssetDialog, setShowUploadAssetDialog] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<{ id: string; name: string; currentLocation: string } | null>(null);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [movements, setMovements] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadAssets = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getAssets({ page: 1, page_size: 200 });
      setAssets((res.data?.items ?? []).map((a: any) => ({
        id: a.id,
        asset_code: a.asset_code,
        name: a.name,
        category: a.category,
        location: a.location,
        status: a.status,
        current_value: a.current_value,
        purchase_date: a.purchase_date ? String(a.purchase_date).slice(0, 10) : undefined,
      })));
    } catch (e: any) {
      setError(e.message || '載入失敗');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAssets();
  }, [loadAssets]);

  const filteredAssets = assets.filter((asset) =>
    asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    asset.asset_code.toLowerCase().includes(searchTerm.toLowerCase())
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
            <p className="text-sm" style={{ color: 'var(--muted)' }}>{assets.length} 件資產</p>
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
            <p className="text-sm" style={{ color: 'var(--muted)' }}>{movements.length} 條記錄</p>
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
            <p className="text-sm" style={{ color: 'var(--muted)' }}>盤點管理</p>
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
                          <td className="px-4 py-3 text-sm font-mono" style={{ color: 'var(--text)' }}>{asset.asset_code}</td>
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
                              <button
                                onClick={() => setSelectedAsset({ id: asset.id, name: asset.name, currentLocation: asset.location })}
                                className="p-1.5 rounded hover:opacity-70"
                                style={{ color: 'var(--brand)' }}
                                title="移動"
                              >
                                <ArrowRightLeft className="w-4 h-4" />
                              </button>
                              <button
                                onClick={async () => {
                                  if (!confirm(`確定刪除資產「${asset.name}」？`)) return;
                                  try {
                                    await api.deleteAsset(asset.id);
                                    await loadAssets();
                                  } catch (e: any) {
                                    alert(e.message || '刪除失敗');
                                  }
                                }}
                                className="p-1.5 rounded hover:opacity-70"
                                style={{ color: 'var(--danger)' }}
                                title="刪除"
                              >
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
                    {movements.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-12 text-center" style={{ color: 'var(--muted)' }}>
                          暫無移動記錄
                        </td>
                      </tr>
                    ) : (
                      movements.map((move: any, idx: number) => (
                        <tr key={move.id || idx} className="hover:opacity-80" style={{ borderBottomWidth: '1px', borderColor: 'var(--border)' }}>
                          <td className="px-4 py-3 text-sm" style={{ color: 'var(--text)' }}>{move.moved_at ? String(move.moved_at).slice(0, 10) : (move.move_date || '')}</td>
                          <td className="px-4 py-3">
                            <div className="text-sm font-medium" style={{ color: 'var(--text)' }}>{move.asset_name || (selectedAsset?.name ?? '')}</div>
                            <div className="text-xs" style={{ color: 'var(--muted)' }}>{move.asset_code || ''}</div>
                          </td>
                          <td className="px-4 py-3 text-sm" style={{ color: 'var(--muted)' }}>{move.from_location}</td>
                          <td className="px-4 py-3 text-sm" style={{ color: 'var(--muted)' }}>{move.to_location}</td>
                          <td className="px-4 py-3 text-sm" style={{ color: 'var(--muted)' }}>{move.moved_by || '-'}</td>
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
              <div className="px-4 py-12 text-center" style={{ color: 'var(--muted)' }}>
                暫無盤點任務
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Asset Dialog */}
      {showAssetDialog && (
        <AssetDialog
          onClose={() => setShowAssetDialog(false)}
          onSaved={() => { setShowAssetDialog(false); loadAssets(); }}
        />
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
        onSubmit={async (data) => {
          try {
            if (selectedAsset) {
              await api.recordMovement(selectedAsset.id, {
                movement_type: 'transfer',
                movement_date: data.move_date,
                from_location: data.from_location,
                to_location: data.to_location,
                reason: data.reason,
              });
              await api.updateAsset(selectedAsset.id, { location: data.to_location });
            }
            setSelectedAsset(null);
            await loadAssets();
          } catch (e: any) {
            alert(e.message || '搬移失敗');
          }
        }}
      />
    </>
  );
}

function AssetDialog({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    category: 'equipment',
    location: '',
    purchase_date: '',
    value: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await api.createAsset({
        asset_code: formData.code,
        name: formData.name,
        category: formData.category,
        location: formData.location,
        purchase_date: formData.purchase_date || undefined,
        current_value: formData.value ? Number(formData.value) : undefined,
        purchase_price: formData.value ? Number(formData.value) : undefined,
      });
      onSaved();
    } catch (err: any) {
      setError(err.message || '添加失敗');
      setSaving(false);
    }
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

          {error && (
            <div className="rounded-md p-3" style={{ backgroundColor: 'var(--danger-bg)', color: 'var(--danger)' }}>
              {error}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2 border rounded-md hover:opacity-80 disabled:opacity-50"
              style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
            >
              取消
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 text-white rounded-md hover:opacity-90 disabled:opacity-50"
              style={{ backgroundColor: 'var(--brand)' }}
            >
              {saving ? '保存中...' : '保存'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
