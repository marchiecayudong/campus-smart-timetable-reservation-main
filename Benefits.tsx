import { CheckCircle2 } from "lucide-react";

const benefits = [
  "Reduce scheduling conflicts by up to 95%",
  "Save administrators 10+ hours per week",
  "Improve classroom utilization by 30%",
  "Instant access from any device, anywhere",
  "Seamless integration with existing systems",
  "24/7 automated support and monitoring",
];

const Benefits = () => {
  return (
    <section className="py-24 px-4">
      <div className="container mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground">
              Why Choose Our
              <span className="bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent"> System?</span>
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Our intelligent timetable reservation system transforms the way educational institutions manage their resources, 
              bringing efficiency and clarity to complex scheduling challenges.
            </p>
            
            <div className="space-y-4 pt-4">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-start gap-3 group">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                    <CheckCircle2 className="w-4 h-4 text-accent" />
                  </div>
                  <p className="text-foreground font-medium">{benefit}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="aspect-square rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 p-8 flex items-center justify-center">
              <div className="w-full h-full rounded-xl bg-card shadow-elegant p-6 space-y-4">
                <div className="h-8 bg-primary/10 rounded animate-pulse" />
                <div className="space-y-2">
                  <div className="h-4 bg-primary/20 rounded w-3/4 animate-pulse delay-100" />
                  <div className="h-4 bg-primary/20 rounded w-1/2 animate-pulse delay-200" />
                </div>
                <div className="grid grid-cols-7 gap-2 pt-4">
                  {[...Array(35)].map((_, i) => (
                    <div 
                      key={i} 
                      className="aspect-square rounded bg-primary/10 animate-pulse"
                      style={{ animationDelay: `${i * 50}ms` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Benefits;
