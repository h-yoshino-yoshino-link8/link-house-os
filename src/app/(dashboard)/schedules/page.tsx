"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Download,
  Share2,
  Filter,
  Loader2,
  Edit,
  Trash2,
  Check,
} from "lucide-react";
import { format, addDays, startOfWeek, eachDayOfInterval, isSameDay, differenceInDays } from "date-fns";
import { ja } from "date-fns/locale";
import { useSchedules, useCreateSchedule, useUpdateSchedule, useDeleteSchedule, useUpdateScheduleProgress, ScheduleItem } from "@/hooks/use-schedules";
import { useAppStore, DEMO_COMPANY_ID } from "@/stores/app-store";
import { toast } from "sonner";

export default function SchedulesPage() {
  const companyId = useAppStore((state) => state.companyId) || DEMO_COMPANY_ID;
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedProject, setSelectedProject] = useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<ScheduleItem | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // フォーム状態
  const [newSchedule, setNewSchedule] = useState({
    projectId: "",
    name: "",
    startDate: "",
    endDate: "",
    assignee: "",
    color: "#3b82f6",
  });

  const [editForm, setEditForm] = useState({
    name: "",
    startDate: "",
    endDate: "",
    assignee: "",
    color: "#3b82f6",
    progress: 0,
  });

  // API からデータ取得
  const { data, isLoading, isError } = useSchedules({
    companyId,
  });
  const projects = data?.data ?? [];
  const createSchedule = useCreateSchedule();
  const deleteSchedule = useDeleteSchedule();
  const updateProgress = useUpdateScheduleProgress();

  // 表示する日付範囲（3週間）
  const startOfView = startOfWeek(currentDate, { weekStartsOn: 1 });
  const days = eachDayOfInterval({
    start: startOfView,
    end: addDays(startOfView, 20),
  });

  const filteredProjects = selectedProject === "all"
    ? projects
    : projects.filter(p => p.id === selectedProject);

  const getBarPosition = (scheduleStart: string, scheduleEnd: string) => {
    const dayWidth = 100 / 21;
    const startDiff = differenceInDays(new Date(scheduleStart), startOfView);
    const duration = differenceInDays(new Date(scheduleEnd), new Date(scheduleStart)) + 1;

    const left = Math.max(0, startDiff * dayWidth);
    const width = Math.min(duration * dayWidth, (21 - Math.max(0, startDiff)) * dayWidth);

    return { left: `${left}%`, width: `${Math.max(width, dayWidth)}%` };
  };

  const isToday = (date: Date) => isSameDay(date, new Date());

  const handleCreateSchedule = async () => {
    if (!newSchedule.projectId || !newSchedule.name || !newSchedule.startDate || !newSchedule.endDate) {
      toast.error("必須項目を入力してください");
      return;
    }

    try {
      await createSchedule.mutateAsync({
        projectId: newSchedule.projectId,
        name: newSchedule.name,
        startDate: newSchedule.startDate,
        endDate: newSchedule.endDate,
        assignee: newSchedule.assignee || undefined,
        color: newSchedule.color,
      });
      toast.success("工程を追加しました");
      setIsDialogOpen(false);
      setNewSchedule({
        projectId: "",
        name: "",
        startDate: "",
        endDate: "",
        assignee: "",
        color: "#3b82f6",
      });
    } catch {
      toast.error("工程の追加に失敗しました");
    }
  };

  const openEditDialog = (schedule: ScheduleItem) => {
    setEditingSchedule(schedule);
    setEditForm({
      name: schedule.name,
      startDate: schedule.startDate.split("T")[0],
      endDate: schedule.endDate.split("T")[0],
      assignee: schedule.assignee || "",
      color: schedule.color || "#3b82f6",
      progress: schedule.progress,
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateProgress = async (scheduleId: string, newProgress: number) => {
    try {
      await updateProgress.mutateAsync({ id: scheduleId, progress: newProgress });
      toast.success("進捗を更新しました");
    } catch {
      toast.error("進捗の更新に失敗しました");
    }
  };

  const handleDeleteSchedule = async (scheduleId: string) => {
    if (!confirm("この工程を削除しますか？")) return;
    try {
      await deleteSchedule.mutateAsync(scheduleId);
      toast.success("工程を削除しました");
    } catch {
      toast.error("工程の削除に失敗しました");
    }
  };

  if (isError) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <p className="text-muted-foreground">データの取得に失敗しました</p>
      </div>
    );
  }

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
                  <Label>案件 *</Label>
                  <Select
                    value={newSchedule.projectId}
                    onValueChange={(value) => setNewSchedule({ ...newSchedule, projectId: value })}
                  >
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
                  <Label>工程名 *</Label>
                  <Input
                    placeholder="例：解体工事"
                    value={newSchedule.name}
                    onChange={(e) => setNewSchedule({ ...newSchedule, name: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>開始日 *</Label>
                    <Input
                      type="date"
                      value={newSchedule.startDate}
                      onChange={(e) => setNewSchedule({ ...newSchedule, startDate: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>終了日 *</Label>
                    <Input
                      type="date"
                      value={newSchedule.endDate}
                      onChange={(e) => setNewSchedule({ ...newSchedule, endDate: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>担当者</Label>
                  <Input
                    placeholder="担当者名"
                    value={newSchedule.assignee}
                    onChange={(e) => setNewSchedule({ ...newSchedule, assignee: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>色</Label>
                  <div className="flex gap-2">
                    {["#ef4444", "#3b82f6", "#eab308", "#22c55e", "#a855f7", "#64748b", "#f97316", "#06b6d4"].map((color) => (
                      <button
                        key={color}
                        type="button"
                        className={`h-8 w-8 rounded-full border-2 ${newSchedule.color === color ? "border-primary" : "border-transparent"}`}
                        style={{ backgroundColor: color }}
                        onClick={() => setNewSchedule({ ...newSchedule, color })}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  キャンセル
                </Button>
                <Button onClick={handleCreateSchedule} disabled={createSchedule.isPending}>
                  {createSchedule.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
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
          {isLoading ? (
            <div className="flex h-64 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="flex h-64 items-center justify-center text-muted-foreground">
              工程が登録されたプロジェクトがありません
            </div>
          ) : (
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
                        <div key={schedule.id} className="flex border-b hover:bg-muted/20 group">
                          <div className="w-64 flex-shrink-0 border-r p-2 pl-6">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div
                                  className="h-3 w-3 rounded-full"
                                  style={{ backgroundColor: schedule.color || "#3b82f6" }}
                                />
                                <span className="text-sm">{schedule.name}</span>
                              </div>
                              <div className="hidden group-hover:flex items-center gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6"
                                  onClick={() => openEditDialog(schedule)}
                                >
                                  <Edit className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 text-destructive hover:text-destructive"
                                  onClick={() => handleDeleteSchedule(schedule.id)}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                            <div className="text-xs text-muted-foreground ml-5">
                              {schedule.assignee || "-"}
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
                            <Popover>
                              <PopoverTrigger asChild>
                                <div
                                  className="absolute top-2 h-10 rounded-md flex items-center px-2 text-white text-xs font-medium shadow-sm cursor-pointer hover:opacity-90 transition-opacity overflow-hidden"
                                  style={{
                                    left: position.left,
                                    width: position.width,
                                    backgroundColor: schedule.color || "#3b82f6",
                                  }}
                                >
                                  {/* Progress background */}
                                  {schedule.progress > 0 && schedule.progress < 100 && (
                                    <div
                                      className="absolute inset-0 bg-black/20"
                                      style={{ left: `${schedule.progress}%` }}
                                    />
                                  )}
                                  <div className="relative truncate">
                                    {schedule.progress > 0 && (
                                      <span className="mr-1">{schedule.progress}%</span>
                                    )}
                                  </div>
                                </div>
                              </PopoverTrigger>
                              <PopoverContent className="w-64" align="start">
                                <div className="space-y-3">
                                  <div className="font-medium">{schedule.name}</div>
                                  <div className="text-sm text-muted-foreground">
                                    {format(new Date(schedule.startDate), "M/d")} - {format(new Date(schedule.endDate), "M/d")}
                                  </div>
                                  <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                      <span>進捗</span>
                                      <span className="font-medium">{schedule.progress}%</span>
                                    </div>
                                    <Slider
                                      value={[schedule.progress]}
                                      min={0}
                                      max={100}
                                      step={5}
                                      onValueCommit={(value) => handleUpdateProgress(schedule.id, value[0])}
                                      className="w-full"
                                    />
                                    <div className="flex justify-between gap-1 pt-2">
                                      {[0, 25, 50, 75, 100].map((val) => (
                                        <Button
                                          key={val}
                                          variant={schedule.progress === val ? "default" : "outline"}
                                          size="sm"
                                          className="h-7 px-2 text-xs"
                                          onClick={() => handleUpdateProgress(schedule.id, val)}
                                        >
                                          {val}%
                                        </Button>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              </PopoverContent>
                            </Popover>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          )}
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
