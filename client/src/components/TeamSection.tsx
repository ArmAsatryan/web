import { teamMembers } from "@/data/siteContent";
import { Card } from "@/components/ui/card";
import armenImg from "@assets/Armen_Asatryan_1770884174859.png";
import gerasimImg from "@assets/Gerasim_Israyelyan_1770884180100.jpg";
import ishkhanImg from "@assets/Ishkhan_Gevorgyan_1770884185940.png";
import spartakImg from "@assets/Spartak_Kyureghyan_1770884192540.jpg";

const imageMap: Record<string, string> = {
  Armen_Asatryan: armenImg,
  Gerasim_Israyelyan: gerasimImg,
  Ishkhan_Gevorgyan: ishkhanImg,
  Spartak_Kyureghyan: spartakImg,
};

export function TeamSection() {
  return (
    <section id="team" className="py-24 sm:py-32" data-testid="section-team">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Meet the <span className="text-[rgb(0,151,178)]">Team</span>
          </h2>
          <p className="text-white/50 text-lg max-w-2xl mx-auto">
            The people behind BALLISTiQ, dedicated to building the best ballistic tools.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {teamMembers.map((member, i) => (
            <Card
              key={i}
              className="group overflow-visible bg-card border-card-border text-center hover-elevate transition-all duration-300"
              data-testid={`card-team-${i}`}
            >
              <div className="aspect-square relative overflow-hidden rounded-t-[inherit]">
                <img
                  src={imageMap[member.image]}
                  alt={member.name}
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                  loading="lazy"
                  width={300}
                  height={300}
                />
              </div>
              <div className="p-5">
                <h3 className="text-base font-semibold text-white mb-1">
                  {member.name}
                </h3>
                <p className="text-[rgb(0,151,178)] text-sm">{member.role}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}