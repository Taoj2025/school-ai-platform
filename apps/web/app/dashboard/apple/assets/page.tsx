'use client';

import { useState } from 'react';
import Topbar from '@/components/layout/Topbar';
import Link from 'next/link';
import { formatDate, assetCategoryLabels, assetStatusLabels, formatCurrency } from '@/lib/utils';
import {
  Plus,
  Search,
  Tabs,
  Package,
  ArrowRightLeft,
  ScanLine,
  Tag,
} from 'lucide-react';

interface Asset {
  id: string;
  name: string;
  asset_no: string;
  category: string;
  location?: string;
  status: string;
  purchase_price?: number;
  purchase_date?: string;
}

export default function AssetsPage() {
  const [activeTab, setActiveTab] = useState<'list' | 'movements' | 'stocktake'>('list');
  const [searchTerm, setSearchTerm] = useState('');

  const assets: Asset[] = [
    { id: '1', name: '投影機 A', asset_no: 'EQ-2024-001', category: 'electronics', location: '101教室', status: 'in_use', purchase_price: 15000, purchase_date: '2024-01-15' },
    { id: '2', name: '課桌椅套裝', asset_no: 'FU-2024-015', category: 'furniture', location: '圖書館', status: 'in_use', purchase_price: 8000, purchase_date: '2024-02-20' },
    { id: '3', name: '打印機 HP', asset_no: 'EQ-2023-008', category: 'electronics', location: '辦公室', status: 'maintenance', purchase_price: 5000, purchase_date: '2023-11-10' },
    { id: '4', name: '貨車 Toyota', asset_no: 'VH-2022-001', category: 'vehicle', status: 'in_use', purchase_price: 200000, purchase_date: '2022-05-01' },
  ];

  return (
    <>
      <Topbar 
        title="資產管理"
        breadcrumbs={[
          { name: 'Apple 子系統', href: '/dashboard/apple' },
          { name: '資產管理' },
        ]}
      />
      
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">資產概覽</h2>
            <p className="text-sm text-gray-500 mt-1">管理學校資產、記錄移動和進行盤點</p>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <ScanLine className="w-4 h-4" />
              資產盤點
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
              <Plus className="w-4 h-4" />
              新增資產
            </button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <button 
            onClick={() => setActiveTab('list')}
            className={`p-4 rounded-lg border ${activeTab === 'list' ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:bg-gray-50'}`}
          >
            <Package className="w-6 h-6 text-gray-600 mb-2" />
            <p className="font-medium">資產列表</p>
            <p className="text-sm text-gray-500">{assets.length} 件資產</p>
          </button>
          <button 
            onClick={() => setActiveTab('movements')}
            className={`p-4 rounded-lg border ${activeTab === 'movements' ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:bg-gray-50'}`}
          >
            <ArrowRightLeft className="w-6 h-6 text-gray-600 mb-2" />
            <p className="font-medium">移動記錄</p>
            <p className="text-sm text-gray-500">查看調動歷史</p>
          </button>
          <button 
            onClick={() => setActiveTab('stocktake')}
            className={`p-4 rounded-lg border ${activeTab === 'stocktake' ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:bg-gray-50'}`}
          >
            <ScanLine className="w-6 h-6 text-gray-600 mb-2" />
            <p className="font-medium">庫存盤點</p>
            <p className="text-sm text-gray-500">進行資產核查</p>
          </button>
          <button className="p-4 rounded-lg border border-gray-200 hover:bg-gray-50">
            <Tag className="w-6 h-6 text-gray-600 mb-2" />
            <p className="font-medium">列印標籤</p>
            <p className="text-sm text-gray-500">批量打印資產標籤</p>
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
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">資產編號</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">名稱</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">類別</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">位置</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">狀態</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">購置金額</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {assets.map((asset) => (
                      <tr key={asset.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-mono text-gray-900">{asset.asset_no}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{asset.name}</td>
                        <td className="px-4 py-3 text-sm">
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700">
                            {assetCategoryLabels[asset.category] || asset.category}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">{asset.location || '-'}</td>
                        <td className="px-4 py-3 text-sm">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            asset.status === 'in_use' ? 'bg-green-100 text-green-700' :
                            asset.status === 'maintenance' ? 'bg-yellow-100 text-yellow-700' :
                            asset.status === 'storage' ? 'bg-gray-100 text-gray-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {assetStatusLabels[asset.status] || asset.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-right font-medium text-gray-900">
                          {asset.purchase_price ? formatCurrency(asset.purchase_price) : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'movements' && (
            <div className="p-6">
              <p className="text-center text-gray-500 py-8">移動記錄功能開發中...</p>
            </div>
          )}

          {activeTab === 'stocktake' && (
            <div className="p-6">
              <p className="text-center text-gray-500 py-8">庫存盤點功能開發中...</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
