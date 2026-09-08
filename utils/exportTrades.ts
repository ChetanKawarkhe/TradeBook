import { Alert } from "react-native";

import * as FileSystem from "expo-file-system/legacy";
import * as Print from "expo-print";
import * as XLSX from "xlsx";

import type { Trade } from "@/types/trade";
import { formatCurrency } from "@/utils/trade";
import { getTradeResultType } from "@/utils/tradeResult";

function formatDate(dateString: string) {
  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export async function exportTradesToExcel(
  trades: Trade[],
): Promise<void> {
  if (trades.length === 0) {
    Alert.alert(
      "No trades",
      "Add at least one trade before exporting.",
    );
    return;
  }

  try {
    const exportData = trades.map((trade) => ({
      Date: formatDate(trade.exitTime),
      Instrument: trade.instrument,
      Direction: trade.direction,
      Quantity: trade.quantity,
      "Entry Price": trade.entryPrice,
      "Exit Price": trade.exitPrice,
      "P&L": trade.pnl,
      Fees: trade.fees,
      Strategy: trade.strategy,
      Setup: trade.setup ?? "",
      "Entry Reason": trade.entryReason ?? "",
      "Exit Reason": trade.exitReason ?? "",
      Emotion: trade.emotion,
      "Emotion Before": trade.emotionBefore ?? "",
      "Emotion During": trade.emotionDuring ?? "",
      "Emotion After": trade.emotionAfter ?? "",
      Confidence: trade.confidence ?? "",
      Stress: trade.stress ?? "",
      FOMO: trade.fomo ?? "",
      "Followed Plan": trade.followedPlan ? "Yes" : "No",
      Result: getTradeResultType(trade),
      "Rule Violation": trade.ruleViolation ?? "",
      Mistake: trade.mistake ?? "",
      "Risk / Reward": trade.riskReward ?? "",
      Notes: trade.notes,
      "Entry Time": trade.entryTime,
      "Exit Time": trade.exitTime,
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);

    worksheet["!cols"] = [
      { wch: 14 },
      { wch: 14 },
      { wch: 10 },
      { wch: 10 },
      { wch: 14 },
      { wch: 14 },
      { wch: 14 },
      { wch: 12 },
      { wch: 18 },
      { wch: 18 },
      { wch: 24 },
      { wch: 24 },
      { wch: 14 },
      { wch: 18 },
      { wch: 18 },
      { wch: 18 },
      { wch: 12 },
      { wch: 10 },
      { wch: 10 },
      { wch: 16 },
      { wch: 14 },
      { wch: 24 },
      { wch: 20 },
      { wch: 16 },
      { wch: 30 },
      { wch: 24 },
      { wch: 24 },
    ];

    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "Trades",
    );

    const excelBase64 = XLSX.write(workbook, {
      type: "base64",
      bookType: "xlsx",
    });

    const permissions =
      await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();

    if (!permissions.granted) {
      return;
    }

    const fileName = `TradeBook_Trades_${new Date()
      .toISOString()
      .slice(0, 10)}.xlsx`;

    const fileUri =
      await FileSystem.StorageAccessFramework.createFileAsync(
        permissions.directoryUri,
        fileName,
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      );

    await FileSystem.writeAsStringAsync(
      fileUri,
      excelBase64,
      {
        encoding: FileSystem.EncodingType.Base64,
      },
    );

    Alert.alert(
      "Export complete",
      `${fileName} was saved successfully.`,
    );
  } catch (error) {
    console.error("Excel export failed:", error);

    Alert.alert(
      "Export failed",
      "Something went wrong while saving the Excel file.",
    );
  }
}

export async function exportTradesToPdf(
  trades: Trade[],
): Promise<void> {
  if (trades.length === 0) {
    Alert.alert(
      "No trades",
      "Add at least one trade before exporting.",
    );
    return;
  }

  try {
    const totalPnl = trades.reduce(
      (sum, trade) => sum + trade.pnl,
      0,
    );

    const wins = trades.filter(
      (trade) => trade.pnl > 0,
    ).length;

    const losses = trades.filter(
      (trade) => trade.pnl < 0,
    ).length;

    const winRate =
      trades.length > 0
        ? Math.round((wins / trades.length) * 100)
        : 0;

    const followedPlan = trades.filter(
      (trade) => trade.followedPlan,
    ).length;

    const planRate =
      trades.length > 0
        ? Math.round(
            (followedPlan / trades.length) * 100,
          )
        : 0;

    const goodWins = trades.filter(
      (trade) =>
        getTradeResultType(trade) === "Good Win",
    ).length;

    const badWins = trades.filter(
      (trade) =>
        getTradeResultType(trade) === "Bad Win",
    ).length;

    const goodLosses = trades.filter(
      (trade) =>
        getTradeResultType(trade) === "Good Loss",
    ).length;

    const badLosses = trades.filter(
      (trade) =>
        getTradeResultType(trade) === "Bad Loss",
    ).length;

    const rows = [...trades]
      .sort(
        (a, b) =>
          new Date(b.exitTime).getTime() -
          new Date(a.exitTime).getTime(),
      )
      .map(
        (trade) => `
          <tr>
            <td>${formatDate(trade.exitTime)}</td>
            <td>${escapeHtml(trade.instrument)}</td>
            <td>${trade.direction}</td>
            <td>${trade.entryPrice.toLocaleString("en-IN")}</td>
            <td>${trade.exitPrice.toLocaleString("en-IN")}</td>
            <td class="${
              trade.pnl >= 0
                ? "positive"
                : "negative"
            }">
              ${formatCurrency(trade.pnl)}
            </td>
            <td>${escapeHtml(
              trade.strategy || "-",
            )}</td>
            <td>${getTradeResultType(trade)}</td>
            <td>${
              trade.followedPlan
                ? "Yes"
                : "No"
            }</td>
          </tr>
        `,
      )
      .join("");

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0"
          />

          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 24px;
              color: #222222;
            }

            h1 {
              margin-bottom: 4px;
            }

            .subtitle {
              color: #666666;
              margin-bottom: 24px;
            }

            .summary {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 10px;
              margin-bottom: 24px;
            }

            .metric {
              border: 1px solid #dddddd;
              border-radius: 8px;
              padding: 12px;
            }

            .label {
              font-size: 10px;
              color: #777777;
              text-transform: uppercase;
            }

            .value {
              font-size: 18px;
              font-weight: bold;
              margin-top: 4px;
            }

            .positive {
              color: #16803c;
            }

            .negative {
              color: #c62828;
            }

            table {
              width: 100%;
              border-collapse: collapse;
              font-size: 9px;
            }

            th {
              background: #f2f2f2;
              text-align: left;
              padding: 7px;
              border: 1px solid #dddddd;
            }

            td {
              padding: 7px;
              border: 1px solid #dddddd;
            }

            .section-title {
              font-size: 15px;
              font-weight: bold;
              margin-bottom: 10px;
            }
          </style>
        </head>

        <body>
          <h1>TradeBook Trading Report</h1>

          <div class="subtitle">
            Generated on ${new Date().toLocaleDateString(
              "en-IN",
              {
                day: "numeric",
                month: "long",
                year: "numeric",
              },
            )}
          </div>

          <div class="summary">
            <div class="metric">
              <div class="label">Total P&L</div>
              <div
                class="value ${
                  totalPnl >= 0
                    ? "positive"
                    : "negative"
                }"
              >
                ${formatCurrency(totalPnl)}
              </div>
            </div>

            <div class="metric">
              <div class="label">Trades</div>
              <div class="value">
                ${trades.length}
              </div>
            </div>

            <div class="metric">
              <div class="label">Win Rate</div>
              <div class="value">
                ${winRate}%
              </div>
            </div>

            <div class="metric">
              <div class="label">Plan Adherence</div>
              <div class="value">
                ${planRate}%
              </div>
            </div>

            <div class="metric">
              <div class="label">Wins</div>
              <div class="value">
                ${wins}
              </div>
            </div>

            <div class="metric">
              <div class="label">Losses</div>
              <div class="value">
                ${losses}
              </div>
            </div>
          </div>

          <div class="section-title">
            Trade Outcomes
          </div>

          <p>
            Good Wins: ${goodWins}
            &nbsp; | &nbsp;
            Bad Wins: ${badWins}
            &nbsp; | &nbsp;
            Good Losses: ${goodLosses}
            &nbsp; | &nbsp;
            Bad Losses: ${badLosses}
          </p>

          <div class="section-title">
            Trade History
          </div>

          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Instrument</th>
                <th>Direction</th>
                <th>Entry</th>
                <th>Exit</th>
                <th>P&L</th>
                <th>Strategy</th>
                <th>Result</th>
                <th>Plan</th>
              </tr>
            </thead>

            <tbody>
              ${rows}
            </tbody>
          </table>
        </body>
      </html>
    `;

    const { uri } =
      await Print.printToFileAsync({
        html,
      });

    const permissions =
      await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();

    if (!permissions.granted) {
      return;
    }

    const fileName = `TradeBook_Report_${new Date()
      .toISOString()
      .slice(0, 10)}.pdf`;

    const fileUri =
      await FileSystem.StorageAccessFramework.createFileAsync(
        permissions.directoryUri,
        fileName,
        "application/pdf",
      );

    const pdfBase64 =
      await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

    await FileSystem.writeAsStringAsync(
      fileUri,
      pdfBase64,
      {
        encoding: FileSystem.EncodingType.Base64,
      },
    );

    Alert.alert(
      "Export complete",
      `${fileName} was saved successfully.`,
    );
  } catch (error) {
    console.error("PDF export failed:", error);

    Alert.alert(
      "Export failed",
      "Something went wrong while creating the PDF.",
    );
  }
}