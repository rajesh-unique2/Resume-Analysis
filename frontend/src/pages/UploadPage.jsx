import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Loader3D from '../components/Loader3D';

import {
  Upload,
  Briefcase,
  Sparkles,
  TrendingUp,
  Shield,
  Zap,
  FileText,
  ArrowRight,
  AlertCircle
} from 'lucide-react';

export default function UploadPage({ isDark }) {
  const navigate = useNavigate();

  const [file, setFile] = useState(null);
  const [jobDescriptions, setJobDescriptions] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [jobCount, setJobCount] = useState(0);

  const handleJobChange = (e) => {
    const text = e.target.value;

    setJobDescriptions(text);

    const jobs = text
      .split('\n')
      .filter((job) => job.trim());

    setJobCount(jobs.length);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      setError('Please upload a resume');
      return;
    }

    if (!jobDescriptions.trim()) {
      setError('Please enter at least one job description');
      return;
    }

    setError('');
    setLoading(true);

    const formData = new FormData();

    // Resume
    formData.append('resume', file);

    // Convert job descriptions into array
    const jobs = jobDescriptions
      .split('\n')
      .map((job) => job.trim())
      .filter((job) => job.length > 0);

    // Backend expects:
    // jobDescriptions = JSON.stringify(array)
    formData.append(
      'jobDescriptions',
      JSON.stringify(jobs)
    );

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/analyze-batch`,
        {
          method: 'POST',
          body: formData,
        }
      );

      /*
       * Before reading SSE, check HTTP status.
       */
      if (!response.ok) {
        let message = 'Analysis failed. Please try again.';

        try {
          const errorData = await response.json();

          if (errorData.message) {
            message = errorData.message;
          }
        } catch {
          // Response wasn't JSON
        }

        throw new Error(message);
      }

      /*
       * Backend uses Server-Sent Events,
       * so response.body must be read as a stream.
       */
      if (!response.body) {
        throw new Error(
          'Streaming response is not supported by this browser.'
        );
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      let buffer = '';

      const results = [];

      let streamError = null;

      /*
       * Read stream until backend closes it.
       */
      while (true) {
        const { value, done } = await reader.read();

        if (done) {
          break;
        }

        buffer += decoder.decode(value, {
          stream: true,
        });

        /*
         * SSE events are separated by:
         *
         * \n\n
         */
        const events = buffer.split('\n\n');

        /*
         * Last element may be incomplete.
         * Keep it for the next chunk.
         */
        buffer = events.pop() || '';

        for (const eventText of events) {
          if (!eventText.trim()) {
            continue;
          }

          let eventName = 'message';
          let data = '';

          const lines = eventText.split('\n');

          for (const line of lines) {
            if (line.startsWith('event:')) {
              eventName = line
                .substring(6)
                .trim();
            }

            if (line.startsWith('data:')) {
              data += line
                .substring(5)
                .trim();
            }
          }

          if (!data) {
            continue;
          }

          let parsedData;

          try {
            parsedData = JSON.parse(data);
          } catch (parseError) {
            console.error(
              'Invalid SSE data:',
              data
            );

            continue;
          }

          /*
           * Batch started
           */
          if (eventName === 'start') {
            console.log(
              'Batch started:',
              parsedData
            );
          }

          /*
           * Individual job completed
           */
          if (eventName === 'result') {
            console.log(
              'Result received:',
              parsedData
            );

            results.push(parsedData);
          }

          /*
           * Individual job failed
           */
          if (eventName === 'error') {
            console.error(
              'Batch job failed:',
              parsedData
            );

            streamError =
              parsedData.message ||
              'One of the jobs failed.';
          }

          /*
           * All jobs completed
           */
          if (eventName === 'done') {
            console.log(
              'Batch analysis completed'
            );
          }
        }
      }

      /*
       * If every job failed, show error.
       */
      if (
        results.length === 0 &&
        streamError
      ) {
        throw new Error(streamError);
      }

      /*
       * Send results to results page.
       */
      navigate('/results', {
        state: {
          results,
          fileName: file.name,
        },
      });

    } catch (err) {
      console.error(
        'Resume analysis error:',
        err
      );

      setError(
        err.message ||
        'Something went wrong while analyzing the resume.'
      );

      setLoading(false);
    }
  };

  /*
   * Show loader while analyzing.
   */
  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-0">

        <Loader3D
          isDark={isDark}
          label={
            `Analyzing ${
              jobCount > 1
                ? `${jobCount} jobs`
                : 'your resume'
            }…`
          }
        />

      </div>
    );
  }

  return (
    <div
      className="
        max-w-4xl
        mx-auto
        animate-fade-slide-up
        px-4
        sm:px-0
      "
    >

      {/* Header */}

      <div className="text-center mb-8 sm:mb-10">

        <div
          className={`
            inline-flex
            items-center
            gap-2
            px-3
            py-1.5
            sm:px-4
            sm:py-2
            rounded-full
            text-xs
            sm:text-sm
            font-medium
            mb-4
            transition-colors
            duration-300
            ${
              isDark
                ? 'bg-indigo-600/20 text-indigo-400'
                : 'bg-indigo-50 text-indigo-700'
            }
          `}
        >
          <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />

          AI-Powered Analysis
        </div>

        <h1
          className={`
            text-2xl
            sm:text-4xl
            md:text-5xl
            font-display
            font-bold
            mb-3
            sm:mb-4
            transition-colors
            duration-300
            ${
              isDark
                ? 'text-white'
                : 'text-slate-900'
            }
          `}
        >
          Smart Resume{' '}

          <span
            className="
              bg-gradient-to-r
              from-indigo-600
              to-purple-600
              bg-clip-text
              text-transparent
            "
          >
            Matching
          </span>
        </h1>

        <p
          className={`
            text-sm
            sm:text-lg
            max-w-2xl
            mx-auto
            transition-colors
            duration-300
            ${
              isDark
                ? 'text-slate-300'
                : 'text-slate-600'
            }
          `}
        >
          Upload your resume and job descriptions
          to get AI-powered insights, match scores,
          and personalized feedback.
        </p>

      </div>

      {/* Feature cards */}

      <div
        className="
          grid
          grid-cols-2
          sm:grid-cols-4
          gap-3
          sm:gap-4
          mb-6
          sm:mb-10
        "
      >

        {[
          {
            icon: Upload,
            label: 'Upload Resume',
            desc: 'PDF format'
          },
          {
            icon: Briefcase,
            label: 'Add Jobs',
            desc: 'Multiple'
          },
          {
            icon: TrendingUp,
            label: 'Get Score',
            desc: 'Match %'
          },
          {
            icon: Shield,
            label: 'AI Feedback',
            desc: 'Insights'
          },
        ].map((item, i) => (

          <div
            key={i}
            className={`
              rounded-xl
              p-3
              sm:p-4
              shadow-sm
              border
              transition-all
              duration-300
              hover:scale-105
              hover:shadow-lg
              ${
                isDark
                  ? 'bg-slate-800/50 border-slate-700/50 hover:border-indigo-500/50'
                  : 'bg-white border-indigo-50/50 hover:border-indigo-200'
              }
            `}
          >

            <div
              className={`
                w-8
                h-8
                sm:w-10
                sm:h-10
                rounded-lg
                flex
                items-center
                justify-center
                mx-auto
                mb-1
                sm:mb-2
                ${
                  isDark
                    ? 'bg-indigo-600/20'
                    : 'bg-indigo-50'
                }
              `}
            >

              <item.icon
                className={`
                  w-4
                  h-4
                  sm:w-5
                  sm:h-5
                  ${
                    isDark
                      ? 'text-indigo-400'
                      : 'text-indigo-600'
                  }
                `}
              />

            </div>

            <p
              className={`
                font-semibold
                text-xs
                sm:text-sm
                text-center
                ${
                  isDark
                    ? 'text-white'
                    : 'text-slate-900'
                }
              `}
            >
              {item.label}
            </p>

            <p
              className={`
                text-[10px]
                sm:text-xs
                text-center
                ${
                  isDark
                    ? 'text-slate-400'
                    : 'text-slate-500'
                }
              `}
            >
              {item.desc}
            </p>

          </div>

        ))}

      </div>

      {/* Form */}

      <div
        className={`
          rounded-2xl
          shadow-xl
          border
          p-4
          sm:p-6
          md:p-8
          ${
            isDark
              ? 'bg-slate-800/50 border-slate-700/50'
              : 'bg-white border-indigo-100/50'
          }
        `}
      >

        <form
          onSubmit={handleSubmit}
          className="space-y-4 sm:space-y-6"
        >

          {/* Resume */}

          <div>

            <label
              className={`
                block
                text-sm
                font-semibold
                mb-2
                ${
                  isDark
                    ? 'text-slate-300'
                    : 'text-slate-700'
                }
              `}
            >
              Upload Resume (PDF)
            </label>

            <div className="relative">

              <input
                type="file"
                accept=".pdf"
                onChange={(e) =>
                  setFile(e.target.files[0])
                }
                className="
                  absolute
                  inset-0
                  w-full
                  h-full
                  opacity-0
                  cursor-pointer
                  z-10
                "
                required
              />

              <div
                className={`
                  border-2
                  border-dashed
                  rounded-xl
                  p-6
                  sm:p-8
                  text-center
                  ${
                    isDark
                      ? 'border-slate-600 hover:border-indigo-500 bg-slate-700/30'
                      : 'border-indigo-200 hover:border-indigo-400 bg-indigo-50/30'
                  }
                `}
              >

                <Upload
                  className="
                    w-8
                    h-8
                    sm:w-10
                    sm:h-10
                    mx-auto
                    mb-2
                    sm:mb-3
                    text-indigo-400
                  "
                />

                <p
                  className={`
                    text-sm
                    sm:text-base
                    ${
                      isDark
                        ? 'text-slate-300'
                        : 'text-slate-600'
                    }
                  `}
                >

                  {file ? (

                    <span
                      className={`
                        font-medium
                        ${
                          isDark
                            ? 'text-indigo-400'
                            : 'text-indigo-600'
                        }
                      `}
                    >

                      <FileText
                        className="
                          w-4
                          h-4
                          inline
                          mr-2
                        "
                      />

                      {file.name}

                    </span>

                  ) : (

                    <>
                      <span className="font-medium">
                        Click to upload
                      </span>{' '}
                      or drag and drop
                    </>

                  )}

                </p>

                <p
                  className={`
                    text-xs
                    mt-1
                    ${
                      isDark
                        ? 'text-slate-500'
                        : 'text-slate-400'
                    }
                  `}
                >
                  PDF only, max 5MB
                </p>

              </div>

            </div>

          </div>

          {/* Job descriptions */}

          <div>

            <div
              className="
                flex
                items-center
                justify-between
                mb-2
              "
            >

              <label
                className={`
                  block
                  text-sm
                  font-semibold
                  ${
                    isDark
                      ? 'text-slate-300'
                      : 'text-slate-700'
                  }
                `}
              >
                Job Descriptions
              </label>

              {jobCount > 0 && (

                <span
                  className={`
                    text-xs
                    px-2
                    py-1
                    sm:px-3
                    rounded-full
                    ${
                      isDark
                        ? 'bg-indigo-600/20 text-indigo-400'
                        : 'bg-indigo-50 text-indigo-600'
                    }
                  `}
                >
                  {jobCount} job
                  {jobCount > 1 ? 's' : ''}
                </span>

              )}

            </div>

            <textarea
              value={jobDescriptions}
              onChange={handleJobChange}
              rows={5}
              className={`
                w-full
                rounded-xl
                border
                px-3
                py-2
                sm:px-4
                sm:py-3
                text-sm
                sm:text-base
                ${
                  isDark
                    ? 'bg-slate-700/50 border-slate-600 text-slate-200 placeholder:text-slate-500'
                    : 'border-indigo-200 text-slate-700 placeholder:text-slate-400'
                }
              `}
              placeholder="
                Paste one or more job descriptions
                (separate with new lines)...
              "
            />

            <p
              className={`
                text-xs
                mt-1
                ${
                  isDark
                    ? 'text-slate-500'
                    : 'text-slate-400'
                }
              `}
            >
              Add multiple job descriptions -
              one per line
            </p>

          </div>

          {/* Error */}

          {error && (

            <div
              className={`
                border
                rounded-xl
                p-3
                sm:p-4
                text-sm
                flex
                items-start
                gap-2
                ${
                  isDark
                    ? 'bg-rose-900/20 border-rose-800 text-rose-400'
                    : 'bg-rose-50 border-rose-200 text-rose-700'
                }
              `}
            >

              <AlertCircle
                className="
                  w-4
                  h-4
                  mt-0.5
                  flex-shrink-0
                "
              />

              <span>{error}</span>

            </div>

          )}

          {/* Submit */}

          <button
            type="submit"
            disabled={loading}
            className="
              w-full
              bg-gradient-to-r
              from-indigo-600
              to-purple-600
              text-white
              font-semibold
              py-3
              px-6
              rounded-xl
              hover:shadow-lg
              transition-all
              duration-300
              disabled:opacity-50
              disabled:cursor-not-allowed
              flex
              items-center
              justify-center
              gap-2
              group
              text-sm
              sm:text-base
            "
          >

            <Zap
              className="
                w-4
                h-4
                sm:w-5
                sm:h-5
              "
            />

            <span>
              Analyze Resume
              {jobCount > 1 ? 's' : ''}
            </span>

            <ArrowRight
              className="
                w-3
                h-3
                sm:w-4
                sm:h-4
              "
            />

          </button>

        </form>

      </div>

      {/* ATS */}

      <div
        className="
          mt-6
          sm:mt-8
          text-center
        "
      >

        <p
          className={`
            text-xs
            sm:text-sm
            ${
              isDark
                ? 'text-slate-400'
                : 'text-slate-500'
            }
          `}
        >
          Need an ATS check? Try our{' '}

          <button
            onClick={() => navigate('/ats')}
            className="
              text-indigo-600
              dark:text-indigo-400
              font-medium
            "
          >
            ATS Scanner
          </button>

        </p>

      </div>

    </div>
  );
}