import { Package, MessageSquare, Eye, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { products, monthlyEnquiries,enquiries } from '@/lib/mockData';
import {useDashboardStore} from '../../features/dashboard/context/dashboard.context.js'
import { useEffect } from 'react';



export default function AdminDashboard() {

const {getDashboard,dashboard,loading} = useDashboardStore()
useEffect(()=>{
  getDashboard()
},[])

if(loading) return (
  <div className='flex justify-center items-center text-3xl'>
    Dashboard Loading.....
  </div>
)

if (!dashboard || dashboard.length === 0) {
  return <div className="p-8">Loading dashboard...</div>;
}



  const currentMonthIndex = new Date().getMonth(); // 0–11
const data = dashboard?.chartData || [];
const nextFiveMonths = Array.from({ length: 6 }, (_, i) => {
  return data[(currentMonthIndex + i) % 12];
});

  console.log(dashboard)

  const stats = [
  {
    label: 'Total Products',
    value: dashboard.kpis.totalProducts,
    icon: Package,
    change: '+2 this month',
  },
  {
    label: 'Total Enquiries',
    value: dashboard.totalEnquiries,
    icon: MessageSquare,
    change: '+3 this week',
  },
  {
    label: 'Most Viewed',
    value: dashboard.topProduct.name,
    icon: Eye,
    change: `${dashboard.topProduct?.views || 0} views`,
    isText: true,
  },
  {
    label: 'New Enquiries',
    value: dashboard.kpis.newEnquiries,
    icon: TrendingUp,
    change: 'Per product',
  },
];


  return (
    <div className="p-8 overflow-auto">
      <div className="mb-8">
        <h1 className="font-display text-3xl text-foreground">Dashboard</h1>
        <p className="font-body text-sm text-muted-foreground mt-1">
          Overview of your jewelry business
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {stats.map((s) => (
          <div key={s.label} className="bg-card border border-border p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="font-body text-xs tracking-widest uppercase text-muted-foreground">
                {s.label}
              </span>
              <s.icon className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className={`${s.isText ? 'font-display text-lg' : 'font-display text-3xl'} text-foreground`}>
              {s.value ?? 0}
            </p>
            <p className="font-body text-xs text-muted-foreground mt-1">{s.change}</p>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="bg-card border border-border p-6">
        <h2 className="font-display text-xl text-foreground mb-6">Monthly Enquiries</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={nextFiveMonths}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(80 10% 88%)" />
            <XAxis
              dataKey="month"
              tick={{ fontFamily: 'Montserrat', fontSize: 12, fill: 'hsl(67 10% 45%)' }}
            />
            <YAxis
              tick={{ fontFamily: 'Montserrat', fontSize: 12, fill: 'hsl(67 10% 45%)' }}
            />
            <Tooltip
              contentStyle={{
                fontFamily: 'Montserrat',
                fontSize: 12,
                border: '1px solid hsl(80 10% 88%)',
                borderRadius: 2,
              }}
            />
            <Bar dataKey="total" fill="hsl(67 20% 28%)" radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Recent Enquiries */}
      <div className="bg-card border border-border p-6 mt-6">
        <h2 className="font-display text-xl text-foreground mb-6">Recent Enquiries</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                {['Name', 'Email', 'Product', 'Date', 'Status'].map((h) => (
                  <th key={h} className="text-left font-body text-[10px] tracking-[0.15em] uppercase text-muted-foreground pb-3 pr-4">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {dashboard.recentEnquiries.map((enq) => (
                <tr key={enq._id} className="border-b border-border last:border-0">
                  <td className="font-body text-sm py-3 pr-4">{enq.name}</td>
                  <td className="font-body text-sm text-muted-foreground py-3 pr-4">{enq.email}</td>
                  <td className="font-body text-sm text-muted-foreground py-3 pr-4">
                    {enq.productName || '—'}
                  </td>
                  <td className="font-body text-sm text-muted-foreground py-3 pr-4">{enq.createdAt}</td>
                  <td className="py-3">
                    <span
                      className={`font-body text-[10px] tracking-wider uppercase px-2 py-1 ${
                        enq.status === 'new'
                          ? 'bg-accent/20 text-accent'
                          : enq.status === 'read'
                          ? 'bg-muted text-muted-foreground'
                          : 'bg-primary/10 text-primary'
                      }`}
                    >
                      {enq.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
