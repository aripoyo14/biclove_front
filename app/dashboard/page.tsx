import SidebarNav from "@/components/sidebar-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Eye, TrendingUp } from "lucide-react";

// Mock data for the dashboard
const knowledgeStats = [
  {
    id: 1,
    title: "家庭用ガス契約者向けのLINEキャンペーン実施",
    views: 148,
    thanks: 24,
  },
  {
    id: 2,
    title: "省エネ診断ツールのWebコンバージョン改善",
    views: 106,
    thanks: 18,
  },
  {
    id: 3,
    title: "電気＋ガスセット契約プロモーションの分析",
    views: 94,
    thanks: 15,
  },
  {
    id: 4,
    title: "メールマーケティングでの契約更新リマインド施策",
    views: 82,
    thanks: 12,
  },
  {
    id: 5,
    title: "SNS広告による30代ファミリー層への認知拡大",
    views: 74,
    thanks: 9,
  },
];

export default function DashboardPage() {
  // Calculate totals
  const totalViews = knowledgeStats.reduce((sum, item) => sum + item.views, 0);
  const totalThanks = knowledgeStats.reduce(
    (sum, item) => sum + item.thanks,
    0
  );
  const engagementRate = Math.round((totalThanks / totalViews) * 100);

  return (
    <div className="flex h-screen bg-cream">
      {/* Sidebar */}
      <SidebarNav />

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="border-b p-4 flex justify-between items-center border-blue/10">
          <div className="flex-1">
            <h1 className="text-lg font-medium text-navy">
              あなたのナレッジの状況
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 rounded-full hover:bg-blue/10">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-navy"
              >
                <path d="M12 2v1"></path>
                <path d="M12 21v1"></path>
                <path d="M4.22 4.22l.77.77"></path>
                <path d="M18.5 18.5l.77.77"></path>
                <path d="M2 12h1"></path>
                <path d="M21 12h1"></path>
                <path d="M4.22 19.78l.77-.77"></path>
                <path d="M18.5 5.5l.77-.77"></path>
              </svg>
            </button>
            <div className="w-8 h-8 rounded-full bg-navy text-cream flex items-center justify-center cursor-pointer">
              <span className="text-sm font-medium">U</span>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-6xl mx-auto">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="bg-white border-blue/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-navy text-lg flex items-center gap-2">
                    <Eye className="h-5 w-5 text-blue" />
                    総閲覧数
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-navy">
                    {totalViews}
                  </div>
                  <p className="text-navy/60 text-sm">
                    あなたのすべてのナレッジに対して
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white border-blue/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-navy text-lg flex items-center gap-2">
                    <Heart className="h-5 w-5 text-blue" />
                    総Thanks数
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-navy">
                    {totalThanks}
                  </div>
                  <p className="text-navy/60 text-sm">すべてのユーザーから</p>
                </CardContent>
              </Card>

              <Card className="bg-white border-blue/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-navy text-lg flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-blue" />
                    Thanks獲得率
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-navy">
                    {engagementRate}%
                  </div>
                  <p className="text-navy/60 text-sm">
                    閲覧数に対するThanksから算出
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Knowledge Performance */}
            <Card className="bg-white border-blue/20 mb-8">
              <CardHeader>
                <CardTitle className="text-navy">
                  ナレッジパフォーマンス
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {knowledgeStats.map((item) => (
                    <div
                      key={item.id}
                      className="border-b border-blue/10 pb-4 last:border-0 last:pb-0"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium text-navy">{item.title}</h3>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1 text-navy/70">
                            <Eye size={16} />
                            <span>{item.views}</span>
                          </div>
                          <div className="flex items-center gap-1 text-navy/70">
                            <Heart size={16} />
                            <span>{item.thanks}</span>
                          </div>
                        </div>
                      </div>
                      <div className="w-full bg-blue/10 rounded-full h-2">
                        <div
                          className="bg-blue h-2 rounded-full"
                          style={{
                            width: `${
                              (item.thanks / knowledgeStats[0].thanks) * 100
                            }%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
