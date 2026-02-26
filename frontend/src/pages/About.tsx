import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import {timelineImages,values} from "../data/timelineImages.js"


export default function About() {
  return (
    <>
      {/* Hero Banner */}
      <section className="bg-primary py-20 lg:py-28">
        <div className="container mx-auto px-4 lg:px-8 text-center">
          <p className="font-body text-[10px] tracking-[0.3em] uppercase text-primary-foreground/60 mb-4 animate-fade-in">
            Est. 1940
          </p>
          <h1 className="font-display text-5xl lg:text-6xl text-primary-foreground mb-6 tracking-wide animate-fade-in" style={{ animationDelay: '0.15s' }}>
            Babulal Jewellers' Legacy
          </h1>
          <p className="font-serif text-lg lg:text-xl text-primary-foreground/80 leading-relaxed max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: '0.3s' }}>
            With a rich heritage spanning more than 80 years, Babulal Jewellers stands as a symbol of timeless elegance and unmatched craftsmanship.
          </p>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20 lg:py-28">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-16">
            <p className="font-body text-[10px] tracking-[0.3em] uppercase text-muted-foreground mb-2">
              Our Journey
            </p>
            <h2 className="font-display text-3xl lg:text-4xl text-foreground">
              Through The Years
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {timelineImages.map((item, i) => (
              <div
                className="w-full bg-card border border-border rounded-lg overflow-hidden cursor-pointer animate-fade-in transition-all duration-500 hover:shadow-[0_25px_60px_-15px_hsl(var(--primary)/0.25)] hover:-translate-y-3 "
                style={{
                  animationDelay: `${i * 0.1}s`,
                  perspective: '1000px',
                }}
              >
                <img src={item} alt=""  className='w-full'/>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-secondary py-20 lg:py-28">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-16">
            <p className="font-body text-[10px] tracking-[0.3em] uppercase text-muted-foreground mb-2">
              What We Stand For
            </p>
            <h2 className="font-display text-3xl lg:text-4xl text-secondary-foreground">
              Our Values
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v, i) => (
              <div
                key={v.title}
                className="group text-center p-8 bg-card rounded-lg border border-border animate-fade-in transition-all duration-500 hover:shadow-[0_20px_50px_-10px_hsl(var(--gold)/0.2)] hover:-translate-y-2"
                style={{
                  animationDelay: `${i * 0.1}s`,
                  perspective: '800px',
                }}
              >
                <div className="transition-transform duration-500 group-hover:[transform:rotateY(-5deg)]" style={{ transformStyle: 'preserve-3d' }}>
                  <h3 className="font-display text-2xl text-gold mb-3">{v.title}</h3>
                  <p className="font-body text-sm text-muted-foreground leading-relaxed">{v.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 lg:py-28">
        <div className="container mx-auto px-4 lg:px-8 text-center max-w-2xl">
          <h2 className="font-display text-3xl lg:text-4xl text-foreground mb-6">
            Where Tradition Meets Artistry
          </h2>
          <p className="font-serif text-lg text-muted-foreground leading-relaxed mb-8">
            Every gemstone is hand-selected, every setting perfected — because true luxury lies in the details.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/products"
              className="inline-flex items-center justify-center gap-2 bg-accent text-accent-foreground font-body text-xs tracking-[0.15em] uppercase px-8 py-4 hover:bg-accent/90 transition-colors"
            >
              Explore Collection <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/enquiry"
              className="inline-flex items-center justify-center gap-2 font-body text-xs tracking-[0.15em] uppercase border border-foreground text-foreground px-8 py-4 hover:bg-foreground hover:text-background transition-colors"
            >
              Get in Touch
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
