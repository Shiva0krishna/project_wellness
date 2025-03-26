import React from "react";
import { motion } from "framer-motion";
import { Github, Globe } from "lucide-react";

type MetricsType = {
  [key: string]: string | undefined;
};

interface ProjectCardProps {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  tags: readonly string[];
  imageSrc: string;
  period?: string;
  metrics: MetricsType;
  links: {
    github?: string;
    live?: string;
    company?: string;
  };
}

const ProjectCard = ({
  id,
  title,
  subtitle,
  description,
  tags,
  imageSrc,
  period,
  links,
  metrics,
}: ProjectCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 100 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="relative group"
    >
      <div className="absolute -left-24 top-8 text-8xl font-extralight text-gray-800/50 hidden md:block">
        {id}
      </div>

      <div
        className="bg-gray-900/30 backdrop-blur-md rounded-lg border border-gray-800/30
                    group-hover:border-gray-700/50 transition-all duration-500
                    shadow-[0_0_15px_rgba(0,0,0,0.1)]"
      >
        <div className="relative w-full aspect-[16/9] overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-8 bg-gray-900/90 backdrop-blur-md flex items-center px-4 gap-2 z-10">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
            </div>
          </div>

          <motion.img
            initial={{ scale: 1.2, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
            src={imageSrc}
            alt={`${title} preview`}
            className="w-full h-full object-cover object-center mt-8"
          />
        </div>

        <div className="p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="space-y-4"
          >
            <div className="mono text-sm text-gray-500 tracking-widest">
              {subtitle}
            </div>
            {period && <div className="text-sm text-gray-500">{period}</div>}
            <h3 className="text-2xl md:text-3xl font-light tracking-tight">
              {title}
            </h3>
            <p className="text-gray-400 max-w-2xl">{description}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 my-6"
          >
            {Object.entries(metrics)
              .filter(([_, value]) => value !== undefined)
              .map(([key, value]) => (
                <div
                  key={key}
                  className="bg-gray-800/30 rounded-lg p-4 border border-gray-700/20"
                >
                  <div className="text-sm text-gray-400 mb-1">{key}</div>
                  <div className="text-xl font-light">{value}</div>
                </div>
              ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="flex flex-wrap gap-2 mb-6"
          >
            {tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 bg-gray-800/30 rounded-full text-sm border border-gray-700/20"
              >
                {tag}
              </span>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="flex gap-4"
          >
            {links.github && (
              <a
                href={links.github}
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors px-4 py-2 rounded-md bg-gray-800/30 border border-gray-700/20"
              >
                <Github size={18} />
                <span>GitHub</span>
              </a>
            )}
            {links.live && (
              <a
                href={links.live}
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors px-4 py-2 rounded-md bg-gray-800/30 border border-gray-700/20"
              >
                <Globe size={18} />
                <span>Live</span>
              </a>
            )}
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProjectCard;
export type { ProjectCardProps };
