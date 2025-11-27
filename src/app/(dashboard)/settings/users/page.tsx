"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Users,
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Key,
  Shield,
  Mail,
  Phone,
  CheckCircle,
  XCircle,
  UserCog,
} from "lucide-react";
import { format } from "date-fns";

// デモデータ
const users = [
  {
    id: "1",
    name: "山田太郎",
    email: "yamada@link-house.co.jp",
    phone: "090-1111-1111",
    role: "admin",
    department: "営業部",
    isActive: true,
    lastLogin: new Date("2024-11-15T09:30:00"),
    createdAt: new Date("2023-04-01"),
  },
  {
    id: "2",
    name: "佐藤次郎",
    email: "sato@link-house.co.jp",
    phone: "090-2222-2222",
    role: "manager",
    department: "営業部",
    isActive: true,
    lastLogin: new Date("2024-11-14T18:45:00"),
    createdAt: new Date("2023-06-15"),
  },
  {
    id: "3",
    name: "田中花子",
    email: "tanaka@link-house.co.jp",
    phone: "090-3333-3333",
    role: "staff",
    department: "営業部",
    isActive: true,
    lastLogin: new Date("2024-11-15T08:00:00"),
    createdAt: new Date("2023-09-01"),
  },
  {
    id: "4",
    name: "鈴木一郎",
    email: "suzuki@link-house.co.jp",
    phone: "090-4444-4444",
    role: "staff",
    department: "工事部",
    isActive: true,
    lastLogin: new Date("2024-11-13T17:20:00"),
    createdAt: new Date("2024-01-15"),
  },
  {
    id: "5",
    name: "高橋美咲",
    email: "takahashi@link-house.co.jp",
    phone: "090-5555-5555",
    role: "viewer",
    department: "経理部",
    isActive: false,
    lastLogin: new Date("2024-10-01T10:00:00"),
    createdAt: new Date("2024-03-01"),
  },
];

const roleLabels: Record<string, { label: string; color: string }> = {
  admin: { label: "管理者", color: "bg-red-100 text-red-800" },
  manager: { label: "マネージャー", color: "bg-purple-100 text-purple-800" },
  staff: { label: "スタッフ", color: "bg-blue-100 text-blue-800" },
  viewer: { label: "閲覧のみ", color: "bg-gray-100 text-gray-800" },
};

const rolePermissions = {
  admin: ["全機能", "ユーザー管理", "会社設定", "マスタ管理", "データエクスポート"],
  manager: ["見積作成", "案件管理", "顧客管理", "分析閲覧", "レポート作成"],
  staff: ["見積作成", "案件管理", "顧客管理"],
  viewer: ["閲覧のみ"],
};

export default function UsersSettingsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredUsers = users.filter(
    (user) =>
      user.name.includes(searchQuery) ||
      user.email.includes(searchQuery) ||
      user.department.includes(searchQuery)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">ユーザー管理</h1>
          <p className="text-muted-foreground">システム利用者の管理・権限設定</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              新規ユーザー
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>新規ユーザー登録</DialogTitle>
              <DialogDescription>新しいユーザーを登録します</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>氏名</Label>
                  <Input placeholder="山田太郎" />
                </div>
                <div className="space-y-2">
                  <Label>部署</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="選択" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sales">営業部</SelectItem>
                      <SelectItem value="construction">工事部</SelectItem>
                      <SelectItem value="accounting">経理部</SelectItem>
                      <SelectItem value="admin">管理部</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>メールアドレス</Label>
                <Input type="email" placeholder="user@link-house.co.jp" />
              </div>
              <div className="space-y-2">
                <Label>電話番号</Label>
                <Input placeholder="090-XXXX-XXXX" />
              </div>
              <div className="space-y-2">
                <Label>権限</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="選択" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">管理者</SelectItem>
                    <SelectItem value="manager">マネージャー</SelectItem>
                    <SelectItem value="staff">スタッフ</SelectItem>
                    <SelectItem value="viewer">閲覧のみ</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>初期パスワード</Label>
                <Input type="password" placeholder="8文字以上" />
                <p className="text-xs text-muted-foreground">
                  初回ログイン時にパスワード変更が必要です
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                キャンセル
              </Button>
              <Button onClick={() => setIsDialogOpen(false)}>登録</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              総ユーザー数
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}人</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              アクティブ
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {users.filter((u) => u.isActive).length}人
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              管理者
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter((u) => u.role === "admin").length}人
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              今月追加
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0人</div>
          </CardContent>
        </Card>
      </div>

      {/* User List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>ユーザー一覧</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="名前・メールで検索..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ユーザー</TableHead>
                <TableHead>部署</TableHead>
                <TableHead>権限</TableHead>
                <TableHead>ステータス</TableHead>
                <TableHead>最終ログイン</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>{user.name.slice(0, 2)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{user.department}</TableCell>
                  <TableCell>
                    <Badge className={roleLabels[user.role].color}>
                      {roleLabels[user.role].label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {user.isActive ? (
                      <Badge variant="outline" className="text-green-600">
                        <CheckCircle className="mr-1 h-3 w-3" />
                        アクティブ
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-gray-500">
                        <XCircle className="mr-1 h-3 w-3" />
                        無効
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {format(user.lastLogin, "M/d HH:mm")}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          編集
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <UserCog className="mr-2 h-4 w-4" />
                          権限変更
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Key className="mr-2 h-4 w-4" />
                          パスワードリセット
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600">
                          <Trash2 className="mr-2 h-4 w-4" />
                          削除
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Role Permissions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            権限一覧
          </CardTitle>
          <CardDescription>各権限で利用可能な機能</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {Object.entries(rolePermissions).map(([role, permissions]) => (
              <Card key={role}>
                <CardHeader className="pb-2">
                  <Badge className={roleLabels[role].color}>
                    {roleLabels[role].label}
                  </Badge>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-1 text-sm">
                    {permissions.map((permission) => (
                      <li key={permission} className="flex items-center gap-2">
                        <CheckCircle className="h-3 w-3 text-green-600" />
                        {permission}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
