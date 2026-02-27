import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Send, CheckCircle } from 'lucide-react';
import { z } from 'zod';
import {useEnquiryStore} from '../features/enquiry/context/enquiry.context.js'
import {useProductStore} from '../features/product/context/product.store.js'
import { toast } from 'sonner';

const enquirySchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100),
  email: z.string().trim().email('Invalid email address').max(255),
  phone: z.string().trim().min(10, 'Phone must be at least 10 digits').max(15),
  message: z.string().trim().min(1, 'Message is required').max(1000),
  product: z.string().trim().min(1, 'Please select a product'),
});

export default function Enquiry() {
  const [searchParams] = useSearchParams();
  const {createEnquiry ,loading} = useEnquiryStore()
  const {products ,getProduct } = useProductStore()
    useEffect(()=>{
    getProduct()
  },[getProduct])

  const productId = searchParams.get('product');
  const product = productId ? products.find((p) => p.id === productId) : null;
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    product: "",
    productName:"",
    message: "",
  });


  const handleChange =  (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
  };

  const handleSubmit = async(e: React.FormEvent) => {
    e.preventDefault();

      const payload = {
        name : form.name,
        email : form.email,
        phone: form.phone,
        product:form.product,
        productName : form.productName,
        message : form.message
      }


    const result = enquirySchema.safeParse(payload);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as string;
        fieldErrors[field] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }else {
      const res = await createEnquiry(payload)
      if(res.success){
        setSubmitted(true);
        toast.success('Enquiry sent successfully!');
      }
    }
  };

  if (submitted) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <CheckCircle className="h-16 w-16 text-accent mb-6" />
        <h1 className="font-display text-3xl text-foreground mb-2">Thank You</h1>
        <p className="font-body text-sm text-muted-foreground max-w-md">
          Your enquiry has been received. Our team will get back to you within 24 hours.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="bg-secondary py-16 lg:py-20">
        <div className="container mx-auto px-4 lg:px-8 text-center">
          <p className="font-body text-[10px] tracking-[0.3em] uppercase text-muted-foreground mb-2">
            Get in Touch
          </p>
          <h1 className="font-display text-4xl lg:text-5xl text-secondary-foreground">
            Send an Enquiry
          </h1>
        </div>
      </div>

      <div className="container mx-auto px-4 lg:px-8 py-16 max-w-2xl">
        {product && (
          <div className="bg-muted p-4 mb-8 flex items-center gap-4">
            <div className="bg-secondary w-16 h-16 flex-shrink-0 overflow-hidden">
              <img src={product.images[0].url} alt={product.name} className="w-full h-full object-cover" />
            </div>
            <div>
              <p className="font-body text-[10px] tracking-[0.2em] uppercase text-muted-foreground">
                Enquiring about
              </p>
              <p className="font-display text-lg text-foreground">{product.name}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {[
            { name: 'name', label: 'Full Name', type: 'text', placeholder: 'Your full name' },
            { name: 'email', label: 'Email', type: 'email', placeholder: 'your@email.com' },
            { name: 'phone', label: 'Phone', type: 'number', placeholder: '+91 XXXXX XXXXX' },
          ].map((field) => (
            <div key={field.name}>
              <label className="block font-body text-xs tracking-[0.1em] uppercase text-muted-foreground mb-2">
                {field.label}
              </label>
              <input
                type={field.type}
                name={field.name}
                value={form[field.name as keyof typeof form]}
                onChange={handleChange}
                placeholder={field.placeholder}
                className="w-full px-4 py-3 bg-background border border-border font-body text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              />
              {errors[field.name] && (
                <p className="font-body text-xs text-destructive mt-1">{errors[field.name]}</p>
              )}
            </div>
          ))}
          <div>
            <label className="block font-body text-xs tracking-[0.1em] uppercase text-muted-foreground mb-2">
              Select Product
            </label>

            <select
              name="product"
              value={form.product}
              onChange={(e) => {
                const selected = products.find(p => p.id === e.target.value);

                setForm({
                  ...form,
                  product: e.target.value,
                  productName: selected.name,
                  message: selected
                    ? `I am interested in "${selected.name}". Please share more details.`
                    : form.message
                });
              }}
              className="w-full px-4 py-3 bg-background border border-border text-sm"
            >
              <option value="">Select a product</option>

              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            {errors.product && (
              <p className="font-body text-xs text-destructive mt-1">
                {errors.product}
              </p>
            )}
          </div>
          <div>
            <label className="block font-body text-xs tracking-[0.1em] uppercase text-muted-foreground mb-2">
              Message
            </label>
            <textarea
              name="message"
              rows={5}
              value={form.message}
              onChange={handleChange}
              placeholder="Tell us what you're looking for..."
              className="w-full px-4 py-3 bg-background border border-border font-body text-sm focus:outline-none focus:ring-1 focus:ring-primary resize-none"
            />
            {errors.message && (
              <p className="font-body text-xs text-destructive mt-1">{errors.message}</p>
            )}
          </div>
          <button
            type="submit"
            disabled={loading}
            className={`flex items-center justify-center gap-2 
              bg-primary text-primary-foreground font-body text-xs 
              tracking-[0.15em] uppercase px-8 py-4 transition-colors w-full
              ${loading ? "opacity-50 cursor-not-allowed" : "hover:bg-primary/90"}
            `}
          >
            <Send className="h-4 w-4" />
            {loading ? "Sending..." : "Submit Enquiry"}
          </button>
        </form>
      </div>
    </div>
  );
}
