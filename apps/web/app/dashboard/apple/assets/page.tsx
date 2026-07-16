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
  Trash2,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';

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

const statusMap = {
  normal: { label: '正常', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  maintenance: { label: '維修中', color: 'bg-yellow-100 text-yellow-700', icon: AlertCircle },
  retired: { label: '已報廢', color: 'bg-gray-100 text-gray-700', icon: null },
};

const stocktakeStatusMap = {
  pending: { label: '待開始', color: 'bg-gray-100 text-gray-700' },
  in_progress: { label: '進行中', color: 'bg-blue-100 text-blue-700' },
  completed: { label: '已完成', color: 'bg-green-100 text-green-700' },
};

export default function AssetsPage() {
  const [activeTab, setActiveTab] = useState<'list' | 'movements' | 'stocktake'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAssetDialog, setShowAssetDialog] = useState(false);

  const filteredAssets = mockAssets.filter((asset) =>
    asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    asset.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <Topbar title="資產管理" />
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">資產概覽</h2>
            <p className="text-sm text-gray-500 mt-1">管理學校資產、記錄移動和進行盤點</p>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <Tag className="w-4 h-4" />
              列印標籤
            </button>
            <button
              onClick={() => setShowAssetDialog(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
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
            className={`p-4 rounded-lg border transition-colors ${
              activeTab === 'list' ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:bg-gray-50'
            }`}
          >
            <Package className="w-6 h-6 text-gray-600 mb-2" />
            <p className="font-medium">資產列表</p>
            <p className="text-sm text-gray-500">{mockAssets.length} 件資產</p>
          </button>
          <button
            onClick={() => setActiveTab('movements')}
            className={`p-4 rounded-lg border transition-colors ${
              activeTab === 'movements' ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:bg-gray-50'
            }`}
          >
            <ArrowRightLeft className="w-6 h-6 text-gray-600 mb-2" />
            <p className="font-medium">移動記錄</p>
            <p className="text-sm text-gray-500">{mockMovements.length} 條記錄</p>
          </button>
          <button
            onClick={() => setActiveTab('stocktake')}
            className={`p-4 rounded-lg border transition-colors ${
              activeTab === 'stocktake' ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:bg-gray-50'
            }`}
          >
            <ScanLine className="w-6 h-6 text-gray-600 mb-2" />
            <p className="font-medium">庫存盤點</p>
            <p className="text-sm text-gray-500">{mockStocktakes.length} 個任務</p>
          </button>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg border border-gray-200">
          {activeTab === 'list' && (
            <div className="p-6">
              <div className="mb-4">
                <div className="relative max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="search"
                    placeholder="搜索資產名稱或編號..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">編號</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">名稱</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">類別</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">位置</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">狀態</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredAssets.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-12 text-center text-gray-500">
                          暫無資產記錄
                        </td>
                      </tr>
                    ) : (
                      filteredAssets.map((asset) => {
                        const StatusIcon = statusMap[asset.status as keyof typeof statusMap]?.icon;
                        return (
                          <tr key={asset.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm font-mono text-gray-900">{asset.code}</td>
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">{asset.name}</td>
                            <td className="px-4 py-3 text-sm text-gray-700">
                              {categories.find((c) => c.value === asset.category)?.label}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700">{asset.location}</td>
                            <td className="px-4 py-3">
                              <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${statusMap[asset.status as keyof typeof statusMap].color}`}>
                                {StatusIcon && <StatusIcon className="w-3 h-3" />}
                                {statusMap[asset.status as keyof typeof statusMap].label}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <button className="p-1.5 text-gray-500 hover:text-primary-600 rounded hover:bg-gray-100">
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button className="p-1.5 text-gray-500 hover:text-primary-600 rounded hover:bg-gray-100">
                                  <ArrowRightLeft className="w-4 h-4" />
                                </button>
                                <button className="p-1.5 text-gray-500 hover:text-primary-600 rounded hover:bg-gray-100">
                                  <Edit className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'movements' && (
            <div className="p-6">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">日期</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">資產</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">從</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">至</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">負責人</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {mockMovements.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-12 text-center text-gray-500">
                          暫無移動記錄
                        </td>
                      </tr>
                    ) : (
                      mockMovements.map((move) => (
                        <tr key={move.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-900">{move.move_date}</td>
                          <td className="px-4 py-3">
                            <div className="text-sm font-medium text-gray-900">{move.asset_name}</div>
                            <div className="text-xs text-gray-500">{move.asset_code}</div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700">{move.from_location}</td>
                          <td className="px-4 py-3 text-sm text-gray-700">{move.to_location}</td>
                          <td className="px-4 py-3 text-sm text-gray-700">{move.moved_by}</td>
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
                <h3 className="text-lg font-semibold">盤點任務</h3>
                <button className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
                  <ScanLine className="w-4 h-4" />
                  開始新盤點
                </button>
              </div>
              <div className="space-y-4">
                {mockStocktakes.map((task) => (
                  <div key={task.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-medium text-gray-900">{task.name}</h4>
                        <p className="text-sm text-gray-500">{task.date}</p>
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${stocktakeStatusMap[task.status as keyof typeof stocktakeStatusMap].color}`}>
                        {stocktakeStatusMap[task.status as keyof typeof stocktakeStatusMap].label}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary-500 rounded-full"
                            style={{ width: `${(task.checked / task.total) * 100}%` }}
                          />
                        </div>
                      </div>
                      <span className="text-sm text-gray-600">
                        {task.checked} / {task.total}
                      </span>
                      {task.status === 'completed' && task.missing === 0 && (
                        <span className="flex items-center gap-1 text-green-600 text-sm">
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('資產已添加');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-lg p-6">
        <h3 className="text-lg font-semibold mb-4">新增資產</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">資產名稱</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">資產編號</label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">類別</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">位置</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">購置日期</label>
              <input
                type="date"
                value={formData.purchase_date}
                onChange={(e) => setFormData({ ...formData, purchase_date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">價值 (HKD)</label>
            <input
              type="number"
              value={formData.value}
              onChange={(e) => setFormData({ ...formData, value: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
            >
              保存
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
