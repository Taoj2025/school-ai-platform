'use client';

import Topbar from '@/components/layout/Topbar';
import Link from 'next/link';
import { BarChart3, Upload, FileText, Users, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

export default function GradeOverviewPage() {
  return (
    <>
      <Topbar title="成績管理" />
      <div className="space-y-4">
        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: '考試場次', value: '8', icon: FileText, color: 'var(--brand)' },
            { label: '待評語', value: '45', icon: Clock, color: 'var(--accent)' },
            { label: '退步預警', value: '3', icon: AlertTriangle, color: 'var(--danger)' },
            { label: '已完成', value: '156', icon: CheckCircle, color: 'var(--good)' },
          ].map((stat) => (
            <div
              key={stat.label}
              className="p-3 rounded-lg"
              style={{ backgroundColor: 'var(--panel)', boxShadow: 'var(--shadow)' }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="p-2.5 rounded-lg"
                  style={{ backgroundColor: 'var(--panel-soft)' }}
                >
                  <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
                </div>
                <div>
                  <p className="text-xs" style={{ color: 'var(--muted)' }}>{stat.label}</p>
                  <p className="text-lg font-bold" style={{ color: 'var(--text)' }}>{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div
          className="p-4 rounded-lg"
          style={{ backgroundColor: 'var(--panel)', boxShadow: 'var(--shadow)' }}
        >
          <h3 className="text-base font-semibold mb-3" style={{ color: 'var(--text)' }}>
            快速操作
          </h3>
          <div className="grid grid-cols-4 gap-3">
            {[
              { name: '新建考試', href: '/dashboard/apple/grade/exams/new', icon: FileText, desc: '創建新考試場次' },
              { name: 'OCR識別', href: '/dashboard/apple/grade/exams/upload', icon: Upload, desc: '試卷掃描識別' },
              { name: '批量評語', href: '/dashboard/apple/grade/comments/batch', icon: Users, desc: 'AI批量生成評語' },
              { name: '預警列表', href: '/dashboard/apple/grade/alerts', icon: AlertTriangle, desc: '退步預警查看' },
            ].map((action) => (
              <Link
                key={action.name}
                href={action.href}
                className="flex items-center gap-3 p-3 rounded-lg border transition-colors hover:border-brand"
                style={{ borderColor: 'var(--border)', backgroundColor: 'var(--panel-soft)' }}
              >
                <div
                  className="p-2 rounded-lg"
                  style={{ backgroundColor: 'var(--brand-light)', color: 'var(--brand-text)' }}
                >
                  <action.icon className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>{action.name}</p>
                  <p className="text-xs" style={{ color: 'var(--muted)' }}>{action.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Exams */}
        <div
          className="p-4 rounded-lg"
          style={{ backgroundColor: 'var(--panel)', boxShadow: 'var(--shadow)' }}
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-semibold" style={{ color: 'var(--text)' }}>
              最近考試
            </h3>
            <Link
              href="/dashboard/apple/grade/exams"
              className="flex items-center gap-1 text-sm hover:underline"
              style={{ color: 'var(--brand)' }}
            >
              查看全部 <BarChart3 className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-2">
            {[
              { name: '中二數學期中考', subject: '數學', date: '2026-07-15', students: 45, avgScore: 78 },
              { name: '中一英語測驗', subject: '英語', date: '2026-07-12', students: 52, avgScore: 82 },
              { name: '中三中文期中考', subject: '中文', date: '2026-07-10', students: 38, avgScore: 75 },
            ].map((exam) => (
              <div
                key={exam.name}
                className="flex items-center justify-between p-3 rounded-lg border"
                style={{ borderColor: 'var(--border)', backgroundColor: 'var(--panel-soft)' }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="p-2 rounded-lg"
                    style={{ backgroundColor: 'var(--brand-light)', color: 'var(--brand-text)' }}
                  >
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>{exam.name}</p>
                    <p className="text-xs" style={{ color: 'var(--muted)' }}>{exam.subject} · {exam.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>{exam.students}人</p>
                  <p className="text-xs" style={{ color: 'var(--muted)' }}>平均 {exam.avgScore}分</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Regression Alerts */}
        <div
          className="p-4 rounded-lg"
          style={{ backgroundColor: 'var(--panel)', boxShadow: 'var(--shadow)' }}
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-semibold" style={{ color: 'var(--text)' }}>
              退步預警
            </h3>
            <Link
              href="/dashboard/apple/grade/alerts"
              className="flex items-center gap-1 text-sm hover:underline"
              style={{ color: 'var(--danger)' }}
            >
              查看全部 <AlertTriangle className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-2">
            {[
              { name: '陳大明', class: '中二甲', from: 85, to: 68, change: -17 },
              { name: '王小華', class: '中二乙', from: 78, to: 62, change: -16 },
              { name: '李小龍', class: '中三甲', from: 90, to: 75, change: -15 },
            ].map((alert) => (
              <div
                key={alert.name}
                className="flex items-center justify-between p-3 rounded-lg border"
                style={{ borderColor: 'var(--danger-light)', backgroundColor: 'var(--danger-bg)' }}
              >
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-4 h-4" style={{ color: 'var(--danger)' }} />
                  <div>
                    <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>{alert.name}</p>
                    <p className="text-xs" style={{ color: 'var(--muted)' }}>{alert.class}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium" style={{ color: 'var(--danger)' }}>{alert.change}%</p>
                  <p className="text-xs" style={{ color: 'var(--muted)' }}>{alert.from} → {alert.to}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
