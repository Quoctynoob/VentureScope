'use client';

import React, { useState } from 'react';
import { PanelBar, PanelBarItem } from '@progress/kendo-react-layout';
import {
  Grid,
  GridColumn,
  GridToolbar,
  GridDataStateChangeEvent,
} from '@progress/kendo-react-grid';
import {
  Chart,
  ChartSeries,
  ChartSeriesItem,
  ChartCategoryAxis,
  ChartCategoryAxisItem,
  ChartLegend,
  ChartTooltip,
  ChartValueAxis,
  ChartValueAxisItem,
} from '@progress/kendo-react-charts';
import { Button } from '@progress/kendo-react-buttons';
import { DropDownList, DropDownListChangeEvent } from '@progress/kendo-react-dropdowns';
import { DatePicker, DatePickerChangeEvent } from '@progress/kendo-react-dateinputs';
import { process, State } from '@progress/kendo-data-query';
import '@progress/kendo-theme-default/dist/all.css';

// ─────────────────────────────────────────────────────────────────────────────
// Dummy Data
// ─────────────────────────────────────────────────────────────────────────────

const CHART_CATEGORIES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'];

const REVENUE_DATA = [45000, 52000, 48000, 61000, 55000, 67000, 71000, 68000];
const EXPENDITURE_DATA = [32000, 38000, 35000, 42000, 39000, 45000, 48000, 44000];

const DEALS = [
  { id: 1, deal: 'Enterprise License',    contact: 'John Smith',    email: 'john.smith@acme.com',      value: 125000, source: 'Direct'   },
  { id: 2, deal: 'SaaS Subscription',     contact: 'Sarah Johnson', email: 'sjohnson@techcorp.com',    value:  48500, source: 'LinkedIn' },
  { id: 3, deal: 'Partnership Agreement', contact: 'Mike Chen',     email: 'm.chen@venture.io',        value:  85200, source: 'Referral' },
  { id: 4, deal: 'Consulting Project',    contact: 'Emily Davis',   email: 'edavis@startup.co',        value:  32000, source: 'Website'  },
  { id: 5, deal: 'Product Bundle',        contact: 'Robert Wilson', email: 'rwilson@corp.net',         value:  67800, source: 'Event'    },
];

const DEAL_FILTERS = ['All deals', 'Active deals', 'Closed deals', 'Pending'];

const INITIAL_GRID_STATE: State = { skip: 0, take: 5, sort: [] };

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

function NotificationTitle() {
  return (
    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', paddingRight: 8 }}>
      <span>🔔&nbsp; Notifications</span>
      <span style={{
        background: '#ef4444',
        color: '#fff',
        borderRadius: 9999,
        padding: '1px 7px',
        fontSize: 11,
        fontWeight: 700,
        lineHeight: '16px',
        minWidth: 18,
        textAlign: 'center',
      }}>3</span>
    </span>
  );
}

function MetricBadge({ value, label, bg, color, muted }: {
  value: string; label: string; bg: string; color: string; muted: string;
}) {
  return (
    <div style={{ background: bg, borderRadius: 12, padding: '10px 22px', textAlign: 'center', minWidth: 96 }}>
      <div style={{ fontSize: 22, fontWeight: 800, color }}>{value}</div>
      <div style={{ fontSize: 11, color: muted, fontWeight: 600, marginTop: 2, letterSpacing: '0.04em' }}>{label}</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Dashboard Page
// ─────────────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [showRevenue, setShowRevenue]           = useState(true);
  const [showExpend, setShowExpend]             = useState(true);
  const [chartDate, setChartDate]               = useState<Date | null>(new Date(2024, 0, 1));
  const [dealFilter, setDealFilter]             = useState<string>('All deals');
  const [gridState, setGridState]               = useState<State>(INITIAL_GRID_STATE);
  const [gridResult, setGridResult]             = useState(() => process(DEALS, INITIAL_GRID_STATE));

  function onGridStateChange(e: GridDataStateChangeEvent) {
    const next = e.dataState as State;
    setGridState(next);
    setGridResult(process(DEALS, next));
  }

  // ── Toggle button style helper ──────────────────────────────────────────────
  function toggleStyle(active: boolean, activeColor: string, borderColor: string) {
    return {
      background: active ? activeColor : 'transparent',
      color:      active ? '#fff'       : activeColor,
      border:     `1.5px solid ${borderColor}`,
      borderRadius: 8,
      fontWeight: 600,
      fontSize: 13,
      padding: '6px 14px',
      cursor: 'pointer',
    } as React.CSSProperties;
  }

  // ── Layout ──────────────────────────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif' }}>

      {/* ══════════════════════════════
          SIDEBAR
      ══════════════════════════════ */}
      <aside style={{
        width: 240,
        background: '#fff',
        borderRight: '1px solid #e2e8f0',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        overflowY: 'auto',
      }}>
        {/* Brand */}
        <div style={{ padding: '20px 16px 16px', borderBottom: '1px solid #f1f5f9' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36, height: 36,
              background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
              borderRadius: 10,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontWeight: 800, fontSize: 16,
            }}>V</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15, color: '#1e293b' }}>VentureScope</div>
              <div style={{ fontSize: 11, color: '#94a3b8' }}>Analytics Platform</div>
            </div>
          </div>
        </div>

        {/* Kendo PanelBar navigation */}
        <PanelBar>
          <PanelBarItem title="📊  Dashboard"   selected />
          <PanelBarItem title="📁  Projects" />
          <PanelBarItem title="📈  Analytics" />
          <PanelBarItem title="📋  Reports" />
          <PanelBarItem title="🔧  Extensions" />
          <PanelBarItem title="🏢  Companies" />
          <PanelBarItem title="👥  People" />
          <PanelBarItem title={<NotificationTitle />} />
        </PanelBar>
      </aside>

      {/* ══════════════════════════════
          MAIN CONTENT
      ══════════════════════════════ */}
      <main style={{ flex: 1, overflowY: 'auto', background: '#f1f5f9', padding: '28px 28px 40px' }}>

        {/* Page heading */}
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#0f172a' }}>Dashboard</h1>
          <p style={{ margin: '4px 0 0', color: '#94a3b8', fontSize: 14 }}>Welcome back — here's your performance overview.</p>
        </div>

        {/* ── PROJECT HEADER CARD ─────────────────────────────────────────────── */}
        <div style={{
          background: '#fff',
          borderRadius: 16,
          padding: '20px 24px',
          marginBottom: 20,
          boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16,
        }}>
          {/* Left: icon + title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{
              width: 58, height: 58,
              background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)',
              borderRadius: 14,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 28,
            }}>🚀</div>
            <div>
              <h2 style={{ margin: 0, fontSize: 19, fontWeight: 700, color: '#0f172a' }}>VentureScope Analytics</h2>
              <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: 13 }}>Q1 2024 · Performance Overview</p>
            </div>
          </div>

          {/* Right: metric badges */}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <MetricBadge value="47"    label="TOTAL DEALS" bg="#eff6ff" color="#2563eb" muted="#60a5fa" />
            <MetricBadge value="$358K" label="REVENUE"     bg="#f0fdf4" color="#16a34a" muted="#4ade80" />
            <MetricBadge value="68%"   label="CONVERSION"  bg="#fff7ed" color="#ea580c" muted="#fb923c" />
          </div>
        </div>

        {/* ── CHART SECTION ───────────────────────────────────────────────────── */}
        <div style={{
          background: '#fff',
          borderRadius: 16,
          padding: '20px 24px',
          marginBottom: 20,
          boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
        }}>
          {/* Chart toolbar */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginBottom: 16, flexWrap: 'wrap', gap: 12,
          }}>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#0f172a' }}>Performance Trends</h3>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              {/* Revenue toggle */}
              <button
                onClick={() => setShowRevenue(v => !v)}
                style={toggleStyle(showRevenue, '#3b82f6', '#3b82f6')}
              >
                ● Revenue
              </button>

              {/* Expenditures toggle */}
              <button
                onClick={() => setShowExpend(v => !v)}
                style={toggleStyle(showExpend, '#ef4444', '#ef4444')}
              >
                ● Expenditures
              </button>

              {/* Date picker */}
              <DatePicker
                value={chartDate}
                onChange={(e: DatePickerChangeEvent) => setChartDate(e.value)}
                format="MMM yyyy"
              />
            </div>
          </div>

          {/* Kendo Line Chart */}
          <Chart style={{ height: 300 }}>
            <ChartTooltip shared />
            <ChartLegend position="bottom" orientation="horizontal" />
            <ChartCategoryAxis>
              <ChartCategoryAxisItem categories={CHART_CATEGORIES} />
            </ChartCategoryAxis>
            <ChartValueAxis>
              <ChartValueAxisItem labels={{ format: '{0:c0}' }} />
            </ChartValueAxis>
            <ChartSeries>
              {showRevenue && (
                <ChartSeriesItem
                  type="line"
                  data={REVENUE_DATA}
                  name="Revenue"
                  color="#3b82f6"
                  markers={{ visible: true, size: 7 }}
                  width={2.5}
                />
              )}
              {showExpend && (
                <ChartSeriesItem
                  type="line"
                  data={EXPENDITURE_DATA}
                  name="Expenditures"
                  color="#ef4444"
                  markers={{ visible: true, size: 7 }}
                  width={2.5}
                />
              )}
            </ChartSeries>
          </Chart>
        </div>

        {/* ── DATA TABLE (KENDO GRID) ─────────────────────────────────────────── */}
        <div style={{
          background: '#fff',
          borderRadius: 16,
          overflow: 'hidden',
          boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
        }}>
          <div style={{ padding: '20px 24px 0' }}>
            <h3 style={{ margin: '0 0 4px', fontSize: 15, fontWeight: 700, color: '#0f172a' }}>Deals</h3>
          </div>

          <Grid
            data={gridResult.data}
            total={gridResult.total}
            {...gridState}
            onDataStateChange={onGridStateChange}
            sortable
            filterable
            pageable={{ pageSizes: [5, 10, 25], info: true, buttonCount: 3 }}
            style={{ border: 'none' }}
          >
            {/* Grid toolbar */}
            <GridToolbar>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '4px 0' }}>
                {/* Deal filter dropdown */}
                <DropDownList
                  data={DEAL_FILTERS}
                  value={dealFilter}
                  onChange={(e: DropDownListChangeEvent) => setDealFilter(e.value as string)}
                  style={{ width: 150 }}
                />

                {/* Action buttons */}
                <Button icon="filter"   fillMode="outline">Filter</Button>
                <Button icon="sort-asc" fillMode="outline">Sort</Button>
                <Button icon="search"   fillMode="outline">Search</Button>

                {/* Spacer */}
                <span style={{ flex: 1 }} />

                {/* Export */}
                <Button fillMode="outline">⬇ Export</Button>

                {/* Add New (red) */}
                <Button style={{
                  background: '#ef4444',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                  fontWeight: 600,
                  padding: '6px 16px',
                }}>
                  + Add New
                </Button>
              </div>
            </GridToolbar>

            {/* Columns */}
            <GridColumn field="id"      title="#"       width="60px" filterable={false} />
            <GridColumn field="deal"    title="Deals" />
            <GridColumn field="contact" title="Contact" />
            <GridColumn field="email"   title="Email" />
            <GridColumn field="value"   title="Value"  filter="numeric" format="${0:n0}" />
            <GridColumn field="source"  title="Source" />
          </Grid>
        </div>

      </main>
    </div>
  );
}
