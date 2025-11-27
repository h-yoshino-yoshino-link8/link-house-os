"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
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
import { Label } from "@/components/ui/label";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar,
  Download,
  Share2,
  Filter,
} from "lucide-react";
import { format, addDays, startOfWeek, eachDayOfInterval, isSameDay, isWithinInterval, differenceInDays } from "date-fns";
import { ja } from "date-fns/locale";

// デモデータ
const projects = [
  {
    id: "1",
    name: "山田邸 キッチンリフォーム",
    customer: "山田太郎 様",
    status: "in_progress",
    startDate: new Date("2024-11-25"),
    endDate: new Date("2024-12-10"),
    progress: 35,
    schedules: [
      { id: "1-1", name: "解体工事", startDate: new Date("2024-11-25"), endDate: new Date("2024-11-27"), progress: 100, color: "#ef4444", assignee: "田中" },
      { id: "1-2", name: "設備配管", startDate: new Date("2024-11-27"), endDate: new Date("2024-11-29"), progress: 80, color: "#3b82f6", assignee: "山本" },
      { id: "1-3", name: "電気工事", startDate: new Date("2024-11-28"), endDate: new Date("2024-11-30"), progress: 50, color: "#eab308", assignee: "佐々木" },
      { id: "1-4", name: "キッチン設置", startDate: new Date("2024-12-02"), endDate: new Date("2024-12-05"), progress: 0, color: "#22c55e", assignee: "鈴木" },
      { id: "1-5", name: "内装仕上げ", startDate: new Date("2024-12-05"), endDate: new Date("2024-12-09"), progress: 0, color: "#a855f7", assignee: "高橋" },
      { id: "1-6", name: "検査・引渡し", startDate: new Date("2024-12-09"), endDate: new Date("2024-12-10"), progress: 0, color: "#64748b", assignee: "担当" },
    ],
  },
  {
    id: "2",
    name: "佐藤邸 外壁塗装",
    customer: "佐藤建設 様",
    status: "in_progress",
    startDate: new Date("2024-11-20"),
    endDate: new Date("2024-12-05"),
    progress: 60,
    schedules: [
      { id: "2-1", name: "足場設置", startDate: new Date("2024-11-20"), endDate: new Date("2024-11-22"), progress: 100, color: "#f97316", assignee: "ABC塗装" },
      { id: "2-2", name: "高圧洗浄", startDate: new Date("2024-11-22"), endDate: new Date("2024-11-23"), progress: 100, color: "#06b6d4", assignee: "ABC塗装" },
      { id: "2-3", name: "下地補修", startDate: new Date("2024-11-25"), endDate: new Date("2024-11-27"), progress: 100, color: "#84cc16", assignee: "ABC塗装" },
      { id: "2-4", name: "下塗り", startDate: new Date("2024-11-27"), endDate: new Date("2024-11-28"), progress: 100, color: "#8b5cf6", assignee: "ABC塗装" },
      { id: "2-5", name: "中塗り", startDate: new Date("2024-11-28"), endDate: new Date("2024-11-30"), progress: 50, color: "#ec4899", assignee: "ABC塗装" },
      { id: "2-6", name: "上塗り", startDate: new Date("2024-12-02"), endDate: new Date("2024-12-03"), progress: 0, color: "#14b8a6", assignee: "ABC塗装" },
      { id: "2-7", name: "足場解体", startDate: new Date("2024-12-04"), endDate: new Date("2024-12-05"), progress: 0, color: "#f97316", assignee: "ABC塗装" },
    ],
  },
  {
    id: "3",
    name: "田中邸 浴室リフォーム",
    customer: "田中花子 様",
    status: "planning",
    startDate: new Date("2024-12-10"),
    endDate: new Date("2024-12-20"),
    progress: 0,
    schedules: [
      { id: "3-1", name: "解体・搬出", startDate: new Date("2024-12-10"), endDate: new Date("2024-12-11"), progress: 0, color: "#ef4444", assignee: "未定" },
      { id: "3-2", name: "配管工事", startDate: new Date("2024-12-12"), endDate: new Date("2024-12-13"), progress: 0, color: "#3b82f6", assignee: "未定" },
      { id: "3-3", name: "電気工事", startDate: new Date("2024-12-12"), endDate: new Date("2024-12-13"), progress: 0, color: "#eab308", assignee: "未定" },
      { id: "3-4", name: "ユニットバス設置", startDate: new Date("2024-12-14"), endDate: new Date("2024-12-17"), progress: 0, color: "#22c55e", assignee: "未定" },
      { id: "3-5", name: "内装仕上げ", startDate: new Date("2024-12-18"), endDate: new Date("2024-12-19"), progress: 0, color: "#a855f7", assignee: "未定" },
      { id: "3-6", name: "検査・引渡し", startDate: new Date("2024-12-20"), endDate: new Date("2024-12-20"), progress: 0, color: "#64748b", assignee: "担当" },
    ],
  },
];

export default function SchedulesPage() {
  const [currentDate, setCurrentDate] = useState(new Date("2024-11-25"));
  const [selectedProject, setSelectedProject] = useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // 表示する日付範囲（3週間）
  const startOfView = startOfWeek(currentDate, { weekStartsOn: 1 });
  const days = eachDayOfInterval({
    start: startOfView,
    end: addDays(startOfView, 20),
  });

  const filteredProjects = selectedProject === "all"
    ? projects
    : projects.filter(p => p.id === selectedProject);

  const getBarPosition = (scheduleStart: Date, scheduleEnd: Date) => {
    const dayWidth = 100 / 21; // 21日分の幅
    const startDiff = differenceInDays(scheduleStart, startOfView);
    const duration = differenceInDays(scheduleEnd, scheduleStart) + 1;

    const left = Math.max(0, startDiff * dayWidth);
    const width = Math.min(duration * dayWidth, (21 - Math.max(0, startDiff)) * dayWidth);

    return { left: `${left}%`, width: `${Math.max(width, dayWidth)}%` };
  };

  const isToday = (date: Date) => isSameDay(date, new Date());

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">工程表</h1>
          <p className="text-muted-foreground">プロジェクトの工程管理・進捗確認</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            PDF出力
          </Button>
          <Button variant="outline">
            <Share2 className="mr-2 h-4 w-4" />
            共有
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                工程追加
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>工程追加</DialogTitle>
                <DialogDescription>
                  新しい工程を追加します
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label>案件</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="案件を選択" />
                    </SelectTrigger>
                    <SelectContent>
                      {projects.map(p => (
                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>工程名</Label>
                  <Input placeholder="例：解体工事" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>開始日</Label>
                    <Input type="date" />
                  </div>
                  <div className="space-y-2">
                    <Label>終了日</Label>
                    <Input type="date" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>担当者</Label>
                  <Input placeholder="担当者名" />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  キャンセル
                </Button>
                <Button onClick={() => setIsDialogOpen(false)}>
                  追加
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentDate(addDays(currentDate, -7))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            onClick={() => setCurrentDate(new Date())}
          >
            今日
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentDate(addDays(currentDate, 7))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <span className="ml-4 font-medium">
            {format(startOfView, "yyyy年M月d日", { locale: ja })} - {format(addDays(startOfView, 20), "M月d日", { locale: ja })}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={selectedProject} onValueChange={setSelectedProject}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="案件を選択" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">すべての案件</SelectItem>
              {projects.map(p => (
                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Gantt Chart */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <div className="min-w-[1200px]">
              {/* Header - Days */}
              <div className="flex border-b">
                <div className="w-64 flex-shrink-0 border-r p-3 font-medium bg-muted/50">
                  案件 / 工程
                </div>
                <div className="flex-1 flex">
                  {days.map((day, index) => (
                    <div
                      key={index}
                      className={`flex-1 text-center p-2 text-xs border-r last:border-r-0 ${
                        isToday(day) ? "bg-primary/10 font-bold" : ""
                      } ${day.getDay() === 0 ? "bg-red-50 dark:bg-red-950/20" : ""} ${day.getDay() === 6 ? "bg-blue-50 dark:bg-blue-950/20" : ""}`}
                    >
                      <div className="text-muted-foreground">
                        {format(day, "E", { locale: ja })}
                      </div>
                      <div className={isToday(day) ? "text-primary" : ""}>
                        {format(day, "d")}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Projects and Schedules */}
              {filteredProjects.map((project) => (
                <div key={project.id}>
                  {/* Project Row */}
                  <div className="flex border-b bg-muted/30">
                    <div className="w-64 flex-shrink-0 border-r p-3">
                      <div className="font-medium">{project.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {project.customer}
                      </div>
                      <div className="mt-1 flex items-center gap-2">
                        <Progress value={project.progress} className="h-1.5 flex-1" />
                        <span className="text-xs text-muted-foreground">
                          {project.progress}%
                        </span>
                      </div>
                    </div>
                    <div className="flex-1 relative">
                      {/* Project Bar Background */}
                      <div className="absolute inset-0 flex">
                        {days.map((day, index) => (
                          <div
                            key={index}
                            className={`flex-1 border-r last:border-r-0 ${
                              isToday(day) ? "bg-primary/5" : ""
                            } ${day.getDay() === 0 ? "bg-red-50/50 dark:bg-red-950/10" : ""} ${day.getDay() === 6 ? "bg-blue-50/50 dark:bg-blue-950/10" : ""}`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Schedule Rows */}
                  {project.schedules.map((schedule) => {
                    const position = getBarPosition(schedule.startDate, schedule.endDate);
                    return (
                      <div key={schedule.id} className="flex border-b hover:bg-muted/20">
                        <div className="w-64 flex-shrink-0 border-r p-2 pl-6">
                          <div className="flex items-center gap-2">
                            <div
                              className="h-3 w-3 rounded-full"
                              style={{ backgroundColor: schedule.color }}
                            />
                            <span className="text-sm">{schedule.name}</span>
                          </div>
                          <div className="text-xs text-muted-foreground ml-5">
                            {schedule.assignee}
                          </div>
                        </div>
                        <div className="flex-1 relative h-14">
                          {/* Day columns */}
                          <div className="absolute inset-0 flex">
                            {days.map((day, index) => (
                              <div
                                key={index}
                                className={`flex-1 border-r last:border-r-0 ${
                                  isToday(day) ? "bg-primary/5" : ""
                                } ${day.getDay() === 0 ? "bg-red-50/50 dark:bg-red-950/10" : ""} ${day.getDay() === 6 ? "bg-blue-50/50 dark:bg-blue-950/10" : ""}`}
                              />
                            ))}
                          </div>
                          {/* Schedule Bar */}
                          <div
                            className="absolute top-2 h-10 rounded-md flex items-center px-2 text-white text-xs font-medium shadow-sm cursor-pointer hover:opacity-90 transition-opacity"
                            style={{
                              left: position.left,
                              width: position.width,
                              backgroundColor: schedule.color,
                            }}
                          >
                            <div className="truncate">
                              {schedule.progress > 0 && (
                                <span className="mr-1">{schedule.progress}%</span>
                              )}
                            </div>
                            {/* Progress overlay */}
                            {schedule.progress > 0 && schedule.progress < 100 && (
                              <div
                                className="absolute inset-0 bg-black/20 rounded-md"
                                style={{ left: `${schedule.progress}%` }}
                              />
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Legend */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">凡例</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-red-500" />
              <span>解体・撤去</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-blue-500" />
              <span>設備工事</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-yellow-500" />
              <span>電気工事</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-green-500" />
              <span>本体設置</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-purple-500" />
              <span>内装仕上げ</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-slate-500" />
              <span>検査・引渡し</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
