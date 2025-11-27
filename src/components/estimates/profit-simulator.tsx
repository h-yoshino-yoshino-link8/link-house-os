"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Calculator,
  TrendingUp,
  TrendingDown,
  Target,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  RotateCcw,
} from "lucide-react";

interface ProfitSimulatorProps {
  costTotal: number;
  currentSubtotal: number;
  currentProfitRate: number;
  taxRate: number;
  onApplyProfitRate?: (rate: number) => void;
  readOnly?: boolean;
}

export function ProfitSimulator({
  costTotal,
  currentSubtotal,
  currentProfitRate,
  taxRate,
  onApplyProfitRate,
  readOnly = false,
}: ProfitSimulatorProps) {
  const [simulatedRate, setSimulatedRate] = useState(currentProfitRate);
  const [targetProfit, setTargetProfit] = useState<number | null>(null);

  // 粗利率から売価を計算
  const calculatePriceFromRate = (cost: number, rate: number) => {
    if (rate >= 100) return cost;
    return cost / (1 - rate / 100);
  };

  // 目標粗利額から粗利率を計算
  const calculateRateFromProfit = (cost: number, targetProfit: number) => {
    const price = cost + targetProfit;
    if (price === 0) return 0;
    return (targetProfit / price) * 100;
  };

  // シミュレーション結果
  const simulation = useMemo(() => {
    const simulatedSubtotal = calculatePriceFromRate(costTotal, simulatedRate);
    const simulatedTax = Math.floor(simulatedSubtotal * (taxRate / 100));
    const simulatedTotal = simulatedSubtotal + simulatedTax;
    const simulatedProfit = simulatedSubtotal - costTotal;
    const priceDiff = simulatedSubtotal - currentSubtotal;
    const profitDiff = simulatedProfit - (currentSubtotal - costTotal);

    return {
      subtotal: simulatedSubtotal,
      tax: simulatedTax,
      total: simulatedTotal,
      profit: simulatedProfit,
      profitRate: simulatedRate,
      priceDiff,
      profitDiff,
    };
  }, [costTotal, simulatedRate, taxRate, currentSubtotal]);

  // 目標粗利からの逆算
  const handleTargetProfitChange = (value: string) => {
    const profit = parseInt(value) || 0;
    setTargetProfit(profit);
    if (profit > 0 && costTotal > 0) {
      const rate = calculateRateFromProfit(costTotal, profit);
      setSimulatedRate(Math.min(Math.max(rate, 0), 60));
    }
  };

  // 粗利率の評価
  const getProfitRateStatus = (rate: number) => {
    if (rate >= 30) return { label: "優良", color: "text-green-600", bg: "bg-green-100" };
    if (rate >= 25) return { label: "良好", color: "text-lime-600", bg: "bg-lime-100" };
    if (rate >= 20) return { label: "標準", color: "text-yellow-600", bg: "bg-yellow-100" };
    if (rate >= 15) return { label: "要注意", color: "text-orange-600", bg: "bg-orange-100" };
    return { label: "危険", color: "text-red-600", bg: "bg-red-100" };
  };

  const currentStatus = getProfitRateStatus(currentProfitRate);
  const simulatedStatus = getProfitRateStatus(simulatedRate);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          粗利シミュレーター
        </CardTitle>
        <CardDescription>
          粗利率を変更して、売価への影響を確認できます
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Status */}
        <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
          <div>
            <p className="text-sm text-muted-foreground">現在の原価合計</p>
            <p className="text-lg font-bold">¥{costTotal.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">現在の売価（税抜）</p>
            <p className="text-lg font-bold">¥{currentSubtotal.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">現在の粗利</p>
            <p className="text-lg font-bold">¥{(currentSubtotal - costTotal).toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">現在の粗利率</p>
            <div className="flex items-center gap-2">
              <p className={`text-lg font-bold ${currentStatus.color}`}>
                {currentProfitRate.toFixed(1)}%
              </p>
              <Badge className={currentStatus.bg}>
                {currentStatus.label}
              </Badge>
            </div>
          </div>
        </div>

        <Separator />

        {/* Simulation Controls */}
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>粗利率シミュレーション</Label>
              <span className={`text-lg font-bold ${simulatedStatus.color}`}>
                {simulatedRate.toFixed(1)}%
              </span>
            </div>
            <Slider
              value={[simulatedRate]}
              onValueChange={([value]) => setSimulatedRate(value)}
              min={0}
              max={60}
              step={0.5}
              className="w-full"
              disabled={readOnly}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0%</span>
              <span className="text-yellow-600">20%</span>
              <span className="text-lime-600">25%</span>
              <span className="text-green-600">30%</span>
              <span>60%</span>
            </div>
          </div>

          {/* Quick Buttons */}
          {!readOnly && (
            <div className="flex gap-2">
              {[15, 20, 25, 30, 35].map((rate) => (
                <Button
                  key={rate}
                  variant={simulatedRate === rate ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSimulatedRate(rate)}
                >
                  {rate}%
                </Button>
              ))}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSimulatedRate(currentProfitRate)}
              >
                <RotateCcw className="h-3 w-3 mr-1" />
                リセット
              </Button>
            </div>
          )}
        </div>

        {/* Target Profit Input */}
        {!readOnly && (
          <div className="space-y-2">
            <Label>目標粗利額から逆算</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">¥</span>
                <Input
                  type="number"
                  placeholder="目標粗利額を入力"
                  value={targetProfit || ""}
                  onChange={(e) => handleTargetProfitChange(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Button
                variant="outline"
                onClick={() => {
                  setTargetProfit(null);
                  setSimulatedRate(currentProfitRate);
                }}
              >
                クリア
              </Button>
            </div>
          </div>
        )}

        <Separator />

        {/* Simulation Results */}
        <div className="space-y-4">
          <h4 className="font-medium flex items-center gap-2">
            <Target className="h-4 w-4" />
            シミュレーション結果
          </h4>

          <div className="grid grid-cols-2 gap-4 p-4 border rounded-lg">
            <div>
              <p className="text-sm text-muted-foreground">売価（税抜）</p>
              <p className="text-lg font-bold">¥{simulation.subtotal.toLocaleString()}</p>
              {simulation.priceDiff !== 0 && (
                <p className={`text-xs flex items-center gap-1 ${simulation.priceDiff > 0 ? "text-green-600" : "text-red-600"}`}>
                  {simulation.priceDiff > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {simulation.priceDiff > 0 ? "+" : ""}¥{simulation.priceDiff.toLocaleString()}
                </p>
              )}
            </div>
            <div>
              <p className="text-sm text-muted-foreground">粗利</p>
              <p className={`text-lg font-bold ${simulatedStatus.color}`}>
                ¥{simulation.profit.toLocaleString()}
              </p>
              {simulation.profitDiff !== 0 && (
                <p className={`text-xs flex items-center gap-1 ${simulation.profitDiff > 0 ? "text-green-600" : "text-red-600"}`}>
                  {simulation.profitDiff > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {simulation.profitDiff > 0 ? "+" : ""}¥{simulation.profitDiff.toLocaleString()}
                </p>
              )}
            </div>
            <div>
              <p className="text-sm text-muted-foreground">消費税（{taxRate}%）</p>
              <p className="text-lg font-bold">¥{simulation.tax.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">合計（税込）</p>
              <p className="text-lg font-bold">¥{simulation.total.toLocaleString()}</p>
            </div>
          </div>

          {/* Status Indicator */}
          <div className={`p-3 rounded-lg flex items-center gap-2 ${simulatedStatus.bg}`}>
            {simulatedRate >= 25 ? (
              <CheckCircle2 className={`h-5 w-5 ${simulatedStatus.color}`} />
            ) : (
              <AlertTriangle className={`h-5 w-5 ${simulatedStatus.color}`} />
            )}
            <div>
              <p className={`font-medium ${simulatedStatus.color}`}>
                粗利率 {simulatedRate.toFixed(1)}% - {simulatedStatus.label}
              </p>
              <p className="text-xs text-muted-foreground">
                {simulatedRate >= 25
                  ? "目標粗利率を達成しています"
                  : "目標粗利率（25%以上）に達していません"}
              </p>
            </div>
          </div>
        </div>

        {/* Apply Button */}
        {!readOnly && onApplyProfitRate && simulatedRate !== currentProfitRate && (
          <>
            <Separator />
            <Button
              className="w-full"
              onClick={() => onApplyProfitRate(simulatedRate)}
            >
              <ArrowRight className="mr-2 h-4 w-4" />
              この粗利率を全明細に適用する（{simulatedRate.toFixed(1)}%）
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
