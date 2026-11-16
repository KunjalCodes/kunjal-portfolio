import React from 'react';
import { ArrowUpRight, GraduationCap, Briefcase, Award, Code, FileText, CheckCircle2 } from 'lucide-react';
import { profile } from '../data/profile';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';

export const AboutPage: React.FC = () => {
  return (
    <div className="pt-28 pb-24 max-w-5xl mx-auto px-6 min-h-screen">
      {/* Header */}
      <div className="max-w-3xl mb-12">
        <div className="font-mono text-xs text-accent mb-2 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-accent" />
          Background & Profile
        </div>
        <h1 className="font-heading text-3xl sm:text-5xl font-bold tracking-tight text-primary">
          About Kunjal Joshi
        </h1>
        <p className="mt-3 text-lg text-muted-light font-normal">
          {profile.title}
        </p>
      </div>

      {/* Main Bio Section */}
      <section className="bg-[#0D0D0D] border border-border rounded-lg p-6 sm:p-8 space-y-4 mb-16">
        <h2 className="font-heading text-xl font-semibold text-primary">
          Engineering Perspective
        </h2>
        <div className="space-y-4 text-sm sm:text-base text-muted leading-relaxed">
          {profile.bio.map((paragraph, idx) => (
            <p key={idx}>{paragraph}</p>
          ))}
        </div>
        <div className="pt-4 flex flex-wrap items-center gap-4 border-t border-border/80">
          <Button
            href={profile.socialLinks.resumeUrl}
            external
            variant="primary"
            size="sm"
            icon={<FileText className="w-4 h-4 text-[#080808]" />}
          >
            Download Resume (PDF)
          </Button>
          <Button to="/contact" variant="secondary" size="sm">
            Contact Directly
          </Button>
          <div className="flex items-center gap-2 text-xs font-mono text-muted ml-auto">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>{profile.status}</span>
          </div>
        </div>
      </section>

      {/* Technical Skills Section */}
      <section className="space-y-6 mb-16">
        <div className="font-mono text-xs text-accent flex items-center gap-2">
          <Code className="w-4 h-4" />
          Technical Stack & Competencies
        </div>
        <h2 className="font-heading text-2xl font-bold text-primary">
          Skills & Technologies
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {profile.skills.map(cat => (
            <div
              key={cat.category}
              className="bg-[#0B0B0B] border border-border rounded-lg p-6 space-y-4"
            >
              <h3 className="font-heading font-medium text-base text-primary flex items-center justify-between">
                <span>{cat.category}</span>
                <span className="text-[11px] font-mono text-accent">({cat.skills.length})</span>
              </h3>
              <div className="space-y-2">
                {cat.skills.map(skill => (
                  <div
                    key={skill.name}
                    className="flex items-center justify-between text-xs font-mono bg-white/[0.02] border border-border/60 px-3 py-1.5 rounded-md"
                  >
                    <span className="text-primary/90">{skill.name}</span>
                    {skill.level && (
                      <span className={`text-[10px] ${
                        skill.level === 'Advanced' ? 'text-accent font-semibold' : 'text-muted'
                      }`}>
                        {skill.level}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Professional Experience */}
      <section className="space-y-6 mb-16">
        <div className="font-mono text-xs text-accent flex items-center gap-2">
          <Briefcase className="w-4 h-4" />
          Career Trajectory
        </div>
        <h2 className="font-heading text-2xl font-bold text-primary">
          Experience & Research
        </h2>

        <div className="space-y-6">
          {profile.experience.map((exp, idx) => (
            <div
              key={idx}
              className="bg-[#0B0B0B] border border-border rounded-lg p-6 sm:p-8 space-y-4 relative"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/70 pb-4">
                <div>
                  <h3 className="font-heading text-lg font-bold text-primary">
                    {exp.role}
                  </h3>
                  <div className="text-sm font-medium text-accent">
                    {exp.organization}
                  </div>
                </div>
                <div className="font-mono text-xs text-muted">
                  {exp.period}
                </div>
              </div>

              <ul className="space-y-2 text-xs sm:text-sm text-muted leading-relaxed">
                {exp.description.map((desc, dIdx) => (
                  <li key={dIdx} className="flex items-start gap-2.5">
                    <span className="text-accent font-mono">›</span>
                    <span>{desc}</span>
                  </li>
                ))}
              </ul>

              <div className="pt-2 flex flex-wrap gap-1.5">
                {exp.technologies.map(tech => (
                  <span
                    key={tech}
                    className="font-mono text-[10px] px-2 py-0.5 rounded bg-white/[0.03] text-muted border border-border"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Key Engineering Achievements */}
      {profile.achievements && profile.achievements.length > 0 && (
        <section className="bg-[#0B0B0B] border border-border rounded-lg p-6 sm:p-8 space-y-4 mb-16">
          <div className="font-mono text-xs text-accent flex items-center gap-2">
            <Award className="w-4 h-4" />
            Key Technical Achievements & Milestones
          </div>
          <h2 className="font-heading text-xl font-bold text-primary">
            Engineering Milestones
          </h2>
          <ul className="space-y-3 text-xs sm:text-sm text-muted">
            {profile.achievements.map((item, idx) => (
              <li key={idx} className="flex items-start gap-3 bg-[#080808] p-3.5 rounded-md border border-border/70">
                <span className="text-accent font-mono font-bold">0{idx + 1}.</span>
                <span className="leading-relaxed text-muted-light">{item}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Education & Certifications */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
        {/* Education */}
        <div className="space-y-4">
          <div className="font-mono text-xs text-accent flex items-center gap-2">
            <GraduationCap className="w-4 h-4" />
            Education
          </div>
          <h2 className="font-heading text-xl font-bold text-primary">
            Academic Foundation
          </h2>

          <div className="space-y-4">
            {profile.education.map((edu, idx) => (
              <div key={idx} className="bg-[#0B0B0B] border border-border rounded-lg p-6 space-y-2">
                <div className="flex justify-between items-start">
                  <h3 className="font-heading text-base font-semibold text-primary">
                    {edu.degree}
                  </h3>
                  <span className="font-mono text-xs text-muted">{edu.period}</span>
                </div>
                <p className="text-xs text-accent font-medium">{edu.field}</p>
                <p className="text-xs text-muted-light font-mono">{edu.institution}</p>
                {edu.details && (
                  <ul className="pt-2 space-y-1 text-xs text-muted">
                    {edu.details.map((d, dIdx) => (
                      <li key={dIdx}>• {d}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Certifications */}
        <div className="space-y-4">
          <div className="font-mono text-xs text-accent flex items-center gap-2">
            <Award className="w-4 h-4" />
            Certifications
          </div>
          <h2 className="font-heading text-xl font-bold text-primary">
            Verified Credentials
          </h2>

          <div className="space-y-4">
            {profile.certifications.map((cert, idx) => (
              <div key={idx} className="bg-[#0B0B0B] border border-border rounded-lg p-6 space-y-2">
                <div className="flex justify-between items-start">
                  <h3 className="font-heading text-base font-semibold text-primary">
                    {cert.title}
                  </h3>
                  <span className="font-mono text-xs text-muted">{cert.date}</span>
                </div>
                <p className="text-xs text-muted">{cert.issuer}</p>
                {cert.credentialId && (
                  <p className="text-[10px] font-mono text-muted-dark">ID: {cert.credentialId}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Resume Banner */}
      <section className="bg-[#0D0D0D] border border-border rounded-lg p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <h3 className="font-heading text-lg font-bold text-primary">
            Curriculum Vitae
          </h3>
          <p className="text-xs sm:text-sm text-muted mt-1">
            Complete record of academic background, technical proficiencies, and project histories.
          </p>
        </div>
        <Button
          href={profile.socialLinks.resumeUrl}
          external
          variant="primary"
          size="md"
          icon={<ArrowUpRight className="w-4 h-4" />}
        >
          View Resume (PDF)
        </Button>
      </section>
    </div>
  );
};
