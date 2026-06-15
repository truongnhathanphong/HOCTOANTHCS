import React from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

interface MathRendererProps {
  text: string;
  className?: string;
  block?: boolean;
  inline?: boolean;
}

export default function MathRenderer({ text, className = '', block = false, inline = false }: MathRendererProps) {
  if (text === null || text === undefined) return null;

  // Render purely as a KaTeX block (display mode)
  if (block) {
    try {
      const html = katex.renderToString(text.trim(), {
        displayMode: true,
        throwOnError: false,
      });
      return <div className={`katex-block-container my-3 overflow-x-auto ${className}`} dangerouslySetInnerHTML={{ __html: html }} />;
    } catch (err) {
      console.error('KaTeX block error:', err);
      return <code className={`${className} font-mono bg-slate-900 border border-slate-800 rounded px-1.5 py-0.5`}>{text}</code>;
    }
  }

  // Render purely as an inline KaTeX node
  if (inline) {
    try {
      const html = katex.renderToString(text.trim(), {
        displayMode: false,
        throwOnError: false,
      });
      return <span className={`katex-inline-container mx-0.5 px-0.5 ${className}`} dangerouslySetInnerHTML={{ __html: html }} />;
    } catch (err) {
      console.error('KaTeX inline error:', err);
      return <code className={`${className} font-mono bg-slate-900 border border-slate-800 rounded px-1`}>{text}</code>;
    }
  }

  // Helper to normalize alternate LaTeX wraps \[ ... \] and \( ... \)
  let normalized = text
    .replace(/\\\[/g, '$$$$')
    .replace(/\\\]/g, '$$$$')
    .replace(/\\\(|\\\)/g, '$');

  // Auto-wrap LaTeX math expressions if they are not wrapped in standard $ or $$ delimiters
  if (!normalized.includes('$')) {
    const mathRegex = /(?:[0-9A-Za-z\s=+\-*/^_{}()[\]\.,\\]*?\\[a-zA-Z]+(?:\{[^{}]*\}|\[[^[\]]*\]|[a-zA-Z0-9\s=+\-*/^_{}()[\]\.,\\])*)/g;
    normalized = normalized.replace(mathRegex, (match) => {
      if (match.includes('\\')) {
        const trimmed = match.trim();
        if (trimmed) {
          return `$${trimmed}$`;
        }
      }
      return match;
    });
  }

  // Parse mixed text with blocks ($$math$$) first
  const blocks = normalized.split('$$');

  return (
    <span className={`math-text-renderer ${className}`}>
      {blocks.map((blockContent, bIdx) => {
        const isBlockMath = bIdx % 2 === 1;

        if (isBlockMath) {
          try {
            const html = katex.renderToString(blockContent.trim(), {
              displayMode: true,
              throwOnError: false,
            });
            return (
              <span
                key={`b-${bIdx}`}
                className="block my-3 overflow-x-auto text-center py-2 bg-slate-950/20 rounded-xl border border-slate-900/40"
                dangerouslySetInnerHTML={{ __html: html }}
              />
            );
          } catch (err) {
            return (
              <code key={`b-${bIdx}`} className="bg-red-950/40 border border-red-900/40 text-red-300 font-mono text-xs px-2 py-1 rounded block my-2 text-center">
                $${blockContent}$$
              </code>
            );
          }
        }

        // Inside a text segment, parse inline equations ($math$)
        const inlines = blockContent.split('$');
        return (
          <span key={`nb-${bIdx}`}>
            {inlines.map((inlineContent, iIdx) => {
              const isInlineMath = iIdx % 2 === 1;

              if (isInlineMath) {
                try {
                  const html = katex.renderToString(inlineContent.trim(), {
                    displayMode: false,
                    throwOnError: false,
                  });
                  return (
                    <span
                      key={`i-${bIdx}-${iIdx}`}
                      className="inline-block mx-1 px-1.5 py-0.5 bg-indigo-500/10 text-indigo-300 rounded font-medium align-middle"
                      dangerouslySetInnerHTML={{ __html: html }}
                    />
                  );
                } catch (err) {
                  return (
                    <code key={`i-${bIdx}-${iIdx}`} className="bg-red-950/40 border border-red-900/40 text-red-300 font-mono px-1 rounded mx-0.5">
                      ${inlineContent}$
                    </code>
                  );
                }
              }

              // Normal text rendering with support for markdown structures
              return renderFormattedText(inlineContent, `t-${bIdx}-${iIdx}`);
            })}
          </span>
        );
      })}
    </span>
  );
}

// Splits lines and handles basic inline bold **word** styles
function renderFormattedText(textStr: string, keyPrefix: string) {
  if (!textStr) return null;

  const lines = textStr.split('\n');
  return (
    <span key={keyPrefix}>
      {lines.map((line, lIdx) => {
        const boldParts = line.split('**');
        const renderedLine = boldParts.map((part, pIdx) => {
          const isBold = pIdx % 2 === 1;
          if (isBold) {
            return (
              <strong key={pIdx} className="font-extrabold text-white">
                {part}
              </strong>
            );
          }
          return part;
        });

        return (
          <React.Fragment key={lIdx}>
            {renderedLine}
            {lIdx < lines.length - 1 && <br />}
          </React.Fragment>
        );
      })}
    </span>
  );
}
