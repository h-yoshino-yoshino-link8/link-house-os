"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  ShoppingCart,
  Search,
  Filter,
  Loader2,
  Plus,
  ExternalLink,
  Building2,
  Banknote,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { formatDate } from "@/lib/utils/date";
import { usePurchaseOrders, useCreatePurchaseOrder } from "@/hooks/use-purchase-orders";
import { usePartners, useCreatePartner } from "@/hooks/use-partners";
import { useProjects } from "@/hooks/use-projects";
import { useAppStore, DEMO_COMPANY_ID } from "@/stores/app-store";
import { toast } from "sonner";

const statusLabels: Record<string, string> = {
  draft: "下書き",
  ordered: "発注済",
  confirmed: "確認済",
  delivered: "納品済",
  invoiced: "請求済",
  paid: "支払済",
  cancelled: "キャンセル",
};

const statusColors: Record<string, string> = {
  draft: "bg-gray-100 text-gray-800",
  ordered: "bg-blue-100 text-blue-800",
  confirmed: "bg-cyan-100 text-cyan-800",
  delivered: "bg-green-100 text-green-800",
  invoiced: "bg-purple-100 text-purple-800",
  paid: "bg-emerald-100 text-emerald-800",
  cancelled: "bg-gray-100 text-gray-500",
};

export default function PurchaseOrdersPage() {
  const companyId = useAppStore((state) => state.companyId) || DEMO_COMPANY_ID;
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

  // 発注書一覧
  const { data: ordersData, isLoading } = usePurchaseOrders({
    companyId,
    status: statusFilter !== "all" ? statusFilter : undefined,
  });
  const orders = ordersData?.data ?? [];

  // 協力会社一覧
  const { data: partnersData } = usePartners({ companyId });
  const partners = partnersData?.data ?? [];

  // 案件一覧
  const { data: projectsData } = useProjects({ companyId });
  const projects = projectsData?.data ?? [];

  // 新規発注
  const [orderDialogOpen, setOrderDialogOpen] = useState(false);
  const [newOrder, setNewOrder] = useState({
    projectId: "",
    partnerId: "",
    title: "",
    orderDate: new Date().toISOString().split("T")[0],
    deliveryDate: "",
    detailName: "",
    quantity: 1,
    unit: "式",
    unitPrice: 0,
  });
  const createOrder = useCreatePurchaseOrder();

  // 新規協力会社
  const [partnerDialogOpen, setPartnerDialogOpen] = useState(false);
  const [newPartner, setNewPartner] = useState({
    name: "",
    category: "",
    phone: "",
    email: "",
  });
  const createPartner = useCreatePartner();

  // フィルタリング
  const filteredOrders = orders.filter((order) =>
    search
      ? order.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
        order.title.toLowerCase().includes(search.toLowerCase()) ||
        order.partner?.name.toLowerCase().includes(search.toLowerCase())
      : true
  );

  // 集計
  const totalAmount = orders.reduce((sum, o) => sum + Number(o.total), 0);
  const paidAmount = orders.reduce((sum, o) => sum + Number(o.paidAmount), 0);
  const unpaidAmount = totalAmount - paidAmount;

  const handleCreateOrder = async () => {
    if (!newOrder.projectId || !newOrder.partnerId || !newOrder.title || !newOrder.detailName) {
      toast.error("必須項目を入力してください");
      return;
    }

    try {
      await createOrder.mutateAsync({
        companyId,
        projectId: newOrder.projectId,
        partnerId: newOrder.partnerId,
        title: newOrder.title,
        orderDate: newOrder.orderDate,
        deliveryDate: newOrder.deliveryDate || undefined,
        details: [{
          name: newOrder.detailName,
          quantity: newOrder.quantity,
          unit: newOrder.unit,
          unitPrice: newOrder.unitPrice,
        }],
      });
      toast.success("発注書を作成しました");
      setOrderDialogOpen(false);
      setNewOrder({
        projectId: "",
        partnerId: "",
        title: "",
        orderDate: new Date().toISOString().split("T")[0],
        deliveryDate: "",
        detailName: "",
        quantity: 1,
        unit: "式",
        unitPrice: 0,
      });
    } catch {
      toast.error("発注書の作成に失敗しました");
    }
  };

  const handleCreatePartner = async () => {
    if (!newPartner.name) {
      toast.error("会社名を入力してください");
      return;
    }

    try {
      await createPartner.mutateAsync({
        companyId,
        name: newPartner.name,
        category: newPartner.category || undefined,
        phone: newPartner.phone || undefined,
        email: newPartner.email || undefined,
      });
      toast.success("協力会社を登録しました");
      setPartnerDialogOpen(false);
      setNewPartner({ name: "", category: "", phone: "", email: "" });
    } catch {
      toast.error("協力会社の登録に失敗しました");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">発注管理</h1>
          <p className="text-muted-foreground">協力会社への発注書管理</p>
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={partnerDialogOpen} onOpenChange={setPartnerDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Building2 className="mr-2 h-4 w-4" />
                協力会社登録
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>協力会社登録</DialogTitle>
                <DialogDescription>新しい協力会社を登録します</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label>会社名 *</Label>
                  <Input
                    placeholder="○○電気工事"
                    value={newPartner.name}
                    onChange={(e) => setNewPartner({ ...newPartner, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>業種</Label>
                  <Select
                    value={newPartner.category}
                    onValueChange={(v) => setNewPartner({ ...newPartner, category: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="業種を選択" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="電気">電気</SelectItem>
                      <SelectItem value="設備">設備</SelectItem>
                      <SelectItem value="内装">内装</SelectItem>
                      <SelectItem value="外装">外装</SelectItem>
                      <SelectItem value="大工">大工</SelectItem>
                      <SelectItem value="塗装">塗装</SelectItem>
                      <SelectItem value="左官">左官</SelectItem>
                      <SelectItem value="その他">その他</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>電話番号</Label>
                    <Input
                      placeholder="03-1234-5678"
                      value={newPartner.phone}
                      onChange={(e) => setNewPartner({ ...newPartner, phone: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>メール</Label>
                    <Input
                      type="email"
                      placeholder="info@example.com"
                      value={newPartner.email}
                      onChange={(e) => setNewPartner({ ...newPartner, email: e.target.value })}
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setPartnerDialogOpen(false)}>
                  キャンセル
                </Button>
                <Button onClick={handleCreatePartner} disabled={createPartner.isPending}>
                  {createPartner.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  登録
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={orderDialogOpen} onOpenChange={setOrderDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                新規発注
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>新規発注書作成</DialogTitle>
                <DialogDescription>協力会社への発注書を作成します</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label>案件 *</Label>
                  <Select
                    value={newOrder.projectId}
                    onValueChange={(v) => setNewOrder({ ...newOrder, projectId: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="案件を選択" />
                    </SelectTrigger>
                    <SelectContent>
                      {projects.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.projectNumber} - {p.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>協力会社 *</Label>
                  <Select
                    value={newOrder.partnerId}
                    onValueChange={(v) => setNewOrder({ ...newOrder, partnerId: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="協力会社を選択" />
                    </SelectTrigger>
                    <SelectContent>
                      {partners.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name} {p.category && `(${p.category})`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>発注件名 *</Label>
                  <Input
                    placeholder="電気工事一式"
                    value={newOrder.title}
                    onChange={(e) => setNewOrder({ ...newOrder, title: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>発注日</Label>
                    <Input
                      type="date"
                      value={newOrder.orderDate}
                      onChange={(e) => setNewOrder({ ...newOrder, orderDate: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>納期</Label>
                    <Input
                      type="date"
                      value={newOrder.deliveryDate}
                      onChange={(e) => setNewOrder({ ...newOrder, deliveryDate: e.target.value })}
                    />
                  </div>
                </div>
                <div className="border-t pt-4">
                  <Label className="mb-2 block">発注内容</Label>
                  <div className="space-y-2">
                    <Input
                      placeholder="品名・内容 *"
                      value={newOrder.detailName}
                      onChange={(e) => setNewOrder({ ...newOrder, detailName: e.target.value })}
                    />
                    <div className="grid grid-cols-3 gap-2">
                      <Input
                        type="number"
                        placeholder="数量"
                        value={newOrder.quantity}
                        onChange={(e) => setNewOrder({ ...newOrder, quantity: parseFloat(e.target.value) || 1 })}
                      />
                      <Input
                        placeholder="単位"
                        value={newOrder.unit}
                        onChange={(e) => setNewOrder({ ...newOrder, unit: e.target.value })}
                      />
                      <Input
                        type="number"
                        placeholder="単価"
                        value={newOrder.unitPrice}
                        onChange={(e) => setNewOrder({ ...newOrder, unitPrice: parseFloat(e.target.value) || 0 })}
                      />
                    </div>
                    <div className="text-right text-sm text-muted-foreground">
                      金額: ¥{(newOrder.quantity * newOrder.unitPrice).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOrderDialogOpen(false)}>
                  キャンセル
                </Button>
                <Button onClick={handleCreateOrder} disabled={createOrder.isPending}>
                  {createOrder.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  作成
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" />
              発注総額
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">¥{totalAmount.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">{orders.length}件の発注</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              支払済
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">¥{paidAmount.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="h-4 w-4 text-orange-600" />
              未払い
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">¥{unpaidAmount.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              協力会社数
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{partners.length}社</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters & Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>発注書一覧</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="発注番号・件名・協力会社で検索"
                  className="pl-9"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="ステータス" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">すべて</SelectItem>
                  <SelectItem value="draft">下書き</SelectItem>
                  <SelectItem value="ordered">発注済</SelectItem>
                  <SelectItem value="confirmed">確認済</SelectItem>
                  <SelectItem value="delivered">納品済</SelectItem>
                  <SelectItem value="invoiced">請求済</SelectItem>
                  <SelectItem value="paid">支払済</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <ShoppingCart className="h-12 w-12 mb-4" />
              <p>発注書がありません</p>
              <p className="text-sm">「新規発注」から発注書を作成できます</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>発注番号</TableHead>
                  <TableHead>件名</TableHead>
                  <TableHead>協力会社</TableHead>
                  <TableHead>案件</TableHead>
                  <TableHead>発注日</TableHead>
                  <TableHead className="text-right">発注額</TableHead>
                  <TableHead>ステータス</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-mono">{order.orderNumber}</TableCell>
                    <TableCell className="font-medium">{order.title}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Building2 className="h-3 w-3 text-muted-foreground" />
                        {order.partner?.name || "-"}
                      </div>
                    </TableCell>
                    <TableCell>
                      {order.project ? (
                        <Link
                          href={`/projects/${order.projectId}`}
                          className="hover:underline text-primary"
                        >
                          {order.project.projectNumber}
                        </Link>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell>{formatDate(order.orderDate)}</TableCell>
                    <TableCell className="text-right font-medium">
                      ¥{Number(order.total).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColors[order.status]}>
                        {statusLabels[order.status]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/projects/${order.projectId}`}>
                          <ExternalLink className="h-4 w-4" />
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
