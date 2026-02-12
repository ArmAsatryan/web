import { motion } from "framer-motion";
import { useInViewAnimation, useStaggerChildren } from "@/hooks/use-in-view-animation";

interface AnimatedSectionProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

export function AnimatedSection({ children, className = "", delay = 0 }: AnimatedSectionProps) {
  const { ref, motionProps } = useInViewAnimation({ delay });

  return (
    <motion.div ref={ref} {...motionProps} className={className}>
      {children}
    </motion.div>
  );
}

interface StaggeredGridProps {
  children: React.ReactNode[];
  className?: string;
  baseDelay?: number;
  staggerDelay?: number;
}

export function StaggeredGrid({ children, className = "", baseDelay = 0.1, staggerDelay = 0.08 }: StaggeredGridProps) {
  const delays = useStaggerChildren(children.length, baseDelay, staggerDelay);

  return (
    <div className={className}>
      {children.map((child, i) => (
        <StaggerItem key={i} delay={delays[i].delay}>
          {child}
        </StaggerItem>
      ))}
    </div>
  );
}

function StaggerItem({ children, delay }: { children: React.ReactNode; delay: number }) {
  const { ref, motionProps } = useInViewAnimation({ delay });

  return (
    <motion.div ref={ref} {...motionProps} className="h-full">
      {children}
    </motion.div>
  );
}