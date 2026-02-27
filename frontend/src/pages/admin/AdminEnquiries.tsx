import { useEffect, useState } from 'react';
import { Eye, Mail, Search } from 'lucide-react';
import { toast } from 'sonner';
import {useEnquiryStore} from '../../features/enquiry/context/enquiry.context.js'

export default function AdminEnquiries() {
  const {getEnquires , enquiry,updateEnquiry} = useEnquiryStore()
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filtered = enquiry.filter(
    (e) =>
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.email.toLowerCase().includes(search.toLowerCase()) ||
      (e.productName || '').toLowerCase().includes(search.toLowerCase())
  );

  const selected = selectedId ? enquiry.find((e) => e._id === selectedId) : null;
  const markAsRead = async(id: string,currentStatus: string) => { 
  if (currentStatus !== "new") {
    return;
  }
    const data = {
      status : "read"
    }
    const res = await updateEnquiry(id , data)
    if(res.success){
      toast.success('Marked as replied');
    }

  };

  const markAsReplied = async(id: string) => {
    const data = {
      status : "replied"
    }
    const res = await updateEnquiry(id , data)
    if(res.success){
     toast.success("Enquiry marked as replied.");
    }
    
  };

  useEffect(()=>{
    getEnquires()
  },[])

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="font-display text-3xl text-foreground">Enquiries</h1>
        <p className="font-body text-sm text-muted-foreground mt-1">
          {enquiry.filter((e) => e.status === 'new').length} new enquiries
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* List */}
        <div className="lg:col-span-2">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search enquiries..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-card border border-border font-body text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="space-y-2">
            {filtered.map((enq) => {
              return (
                <button
                key={enq._id}
                onClick={() => {
                   markAsRead(enq._id,enq.status)
                   setSelectedId(enq._id)
                }}
                className={`w-full text-left bg-card border p-4 transition-colors ${
                  selectedId === enq.id ? 'border-primary' : 'border-border hover:border-primary/50'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`font-body text-sm ${enq.status === 'new' ? 'font-semibold text-foreground' : 'text-foreground'}`}>
                    {enq.name}
                  </span>
                  <span
                    className={`font-body text-[10px] tracking-wider uppercase px-2 py-0.5 ${
                      enq.status === 'new'
                        ? 'bg-accent/20 text-accent'
                        : enq.status === 'read'
                        ? 'bg-muted text-muted-foreground'
                        : 'bg-primary/10 text-primary'
                    }`}
                  >
                    {enq.status}
                  </span>
                </div>
                <p className="font-body text-xs text-muted-foreground truncate">{enq.message}</p>
                <p className="font-body text-[10px] text-muted-foreground mt-1">{enq.createdAt}</p>
              </button>
              )
                })}
          </div>
        </div>

        {/* Detail */}
        <div className="bg-card border border-border p-6 h-fit sticky top-20">
          {selected ? (
            <>
              <h2 className="font-display text-xl text-foreground mb-1">{selected.name}</h2>
              <p className="font-body text-sm text-muted-foreground mb-4">{selected.email}</p>

              <div className="space-y-3 mb-6">
                <div>
                  <span className="font-body text-[10px] tracking-[0.15em] uppercase text-muted-foreground">
                    Phone
                  </span>
                  <p className="font-body text-sm">{selected.phone}</p>
                </div>
                {selected.productName && (
                  <div>
                    <span className="font-body text-[10px] tracking-[0.15em] uppercase text-muted-foreground">
                      Product
                    </span>
                    <p className="font-body text-sm">{selected.productName}</p>
                  </div>
                )}
                <div>
                  <span className="font-body text-[10px] tracking-[0.15em] uppercase text-muted-foreground">
                    Message
                  </span>
                  <p className="font-body text-sm leading-relaxed mt-1">{selected.message}</p>
                </div>
              </div>

              {selected.status !== 'replied' && (
                <button
                  onClick={() => markAsReplied(selected._id)}
                  className="flex items-center gap-2 bg-primary text-primary-foreground font-body text-xs tracking-[0.15em] uppercase px-6 py-3 hover:bg-primary/90 transition-colors w-full justify-center"
                >
                  <Mail className="h-4 w-4" /> Mark as Replied
                </button>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <Eye className="h-8 w-8 text-muted-foreground/30 mx-auto mb-3" />
              <p className="font-body text-sm text-muted-foreground">Select an enquiry to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
