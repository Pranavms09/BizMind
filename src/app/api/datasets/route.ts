import { NextResponse } from 'next/server';
import {
  parseSalesCSV,
  computeDatasetKPIs,
  compareDatasetPeriods,
} from '@/lib/analytics';
import {
  saveDataset,
  getAllDatasets,
  getDataset,
  getStoredDecisions,
} from '@/lib/db';
import {
  DECEMBER_SALES_CSV,
  JANUARY_SALES_CSV,
  FEBRUARY_SALES_CSV,
  MARCH_SALES_CSV,
} from '@/data/sample-datasets';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const all = getAllDatasets();
    return NextResponse.json({ datasets: all });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    let { label, csvContent, preset, previousLabel } = body;

    // Support one-click demo presets
    if (preset) {
      if (preset === 'december') {
        csvContent = DECEMBER_SALES_CSV;
        label = label || 'December 2025';
      } else if (preset === 'january') {
        csvContent = JANUARY_SALES_CSV;
        label = label || 'January 2026';
        previousLabel = previousLabel || 'December 2025';
      } else if (preset === 'february') {
        csvContent = FEBRUARY_SALES_CSV;
        label = label || 'February 2026';
        previousLabel = previousLabel || 'January 2026';
      } else if (preset === 'march') {
        csvContent = MARCH_SALES_CSV;
        label = label || 'March 2026';
        previousLabel = previousLabel || 'February 2026';
      }
    }

    if (!csvContent || !label) {
      return NextResponse.json(
        { error: 'Both label and csvContent (or a valid preset) are required.' },
        { status: 400 }
      );
    }

    const { records, errors } = parseSalesCSV(csvContent);
    if (errors.length > 0 && records.length === 0) {
      return NextResponse.json(
        { error: 'CSV parsing failed completely.', details: errors },
        { status: 400 }
      );
    }

    // 1. Calculate deterministic KPIs
    let currentKPIs = computeDatasetKPIs(records, label);

    // 2. Look for previous dataset for period-over-period comparison
    let previousDataset = previousLabel ? getDataset(previousLabel) : null;

    if (!previousDataset) {
      // Auto-detect previous period if not explicitly given
      const all = getAllDatasets();
      const labels = Object.keys(all);
      if (labels.length > 0 && labels[labels.length - 1] !== label) {
        previousDataset = all[labels[labels.length - 1]];
      }
    }

    const comparison = compareDatasetPeriods(
      currentKPIs,
      previousDataset?.kpis
    );

    // 3. Save to local repository
    saveDataset(label, records, comparison.kpis, comparison.situations);

    // 4. Check for pending decisions on affected products
    const storedDecisions = getStoredDecisions();
    const pendingDecisions = storedDecisions.filter((d) => d.status === 'pending_outcome');
    const outcomeCandidates = [];

    for (const dec of pendingDecisions) {
      const prodKPI = comparison.kpis.productKPIs[dec.affectedProduct];
      if (prodKPI && prodKPI.previousRevenue !== undefined) {
        const actualChange =
          dec.affectedMetric === 'quantity'
            ? prodKPI.quantityChangePercent ?? 0
            : prodKPI.revenueChangePercent ?? 0;

        outcomeCandidates.push({
          decision: dec,
          currentPeriod: label,
          product: dec.affectedProduct,
          metric: dec.affectedMetric,
          previousValue:
            dec.affectedMetric === 'quantity'
              ? prodKPI.previousQuantity
              : prodKPI.previousRevenue,
          actualValue:
            dec.affectedMetric === 'quantity'
              ? prodKPI.totalQuantity
              : prodKPI.totalRevenue,
          actualChangePercent: actualChange,
          expectedChangePercent: dec.expectedGrowthPercent ?? 15,
        });
      }
    }

    return NextResponse.json({
      success: true,
      label,
      recordCount: records.length,
      kpis: comparison.kpis,
      situations: comparison.situations,
      outcomeCandidates,
      parseErrors: errors.length > 0 ? errors : undefined,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
