import React, { useState } from 'react';
import { Student } from '../../../types';
import { INITIAL_ONLINE_CLASSES } from '../mockStudentData';
import { OnlineClassSession } from '../types';
import { 
  Video, 
  Radio, 
  Play, 
  ExternalLink, 
  Clock, 
  Calendar, 
  User, 
  MessageSquare, 
  Send, 
  CheckCircle2,
  FileText,
  Sparkles
} from 'lucide-react';

interface StudentOnlineClassesTabProps {
  currentStudent: Student;
}

export const StudentOnlineClassesTab: React.FC<StudentOnlineClassesTabProps> = ({ currentStudent }) => {
  const [onlineSessions, setOnlineSessions] = useState<OnlineClassSession[]>(INITIAL_ONLINE_CLASSES);
  const [selectedVideo, setSelectedVideo] = useState<OnlineClassSession | null>(null);
  const [doubtText, setDoubtText] = useState('');
  const [doubtSuccess, setDoubtSuccess] = useState(false);

  const liveSessions = onlineSessions.filter(s => s.status === 'ao_vivo');
  const upcomingSessions = onlineSessions.filter(s => s.status === 'agendada');
  const recordedSessions = onlineSessions.filter(s => s.status === 'concluida');

  const handleSendDoubt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!doubtText.trim()) return;
    setDoubtSuccess(true);
    setDoubtText('');
    setTimeout(() => {
      setDoubtSuccess(false);
    }, 4000);
  };

  return (
    <div id="student-online-classes-tab" className="space-y-6">
      
      {/* Header do Hub de Aulas Online */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 rounded-2xl shadow-md border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="px-2.5 py-0.5 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-full text-xs font-semibold">
              HUB DE EDUCAÇÃO A DISTÂNCIA (EAD)
            </span>
            <h2 className="text-xl font-black text-white flex items-center gap-2 mt-1">
              <Video className="w-6 h-6 text-indigo-400" />
              Aulas Online & Sessões Virtuais
            </h2>
            <p className="text-xs text-slate-400 max-w-xl">
              Acesse salas de aula ao vivo via Google Meet e Zoom, e assista às gravações integrais das aulas anteriores.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-4 py-2 bg-indigo-900/50 border border-indigo-700/50 rounded-xl text-center">
              <span className="text-[10px] text-indigo-300 uppercase font-bold block">Status da Conexão</span>
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 justify-center mt-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                Transmissões Prontas
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* SESSÕES AO VIVO */}
      {liveSessions.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
              Aulas Ao Vivo Agora
            </h3>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {liveSessions.map(session => (
              <div
                key={session.id}
                className="bg-white rounded-2xl border-2 border-rose-200 p-6 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 bg-rose-500 text-white rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                      <Radio className="w-3 h-3 animate-pulse" />
                      AO VIVO AGORA
                    </span>
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-xs font-semibold">
                      {session.platform}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      Início: {session.scheduledDateTime.split(' ')[1]} ({session.durationMinutes} min)
                    </span>
                  </div>

                  <h4 className="text-base font-bold text-slate-900">{session.title}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">{session.summary}</p>

                  <div className="flex items-center gap-4 text-xs text-slate-500 pt-1">
                    <span className="font-semibold text-emerald-700">{session.disciplineName}</span>
                    <span>•</span>
                    <span>Professor: {session.teacherName}</span>
                    {session.accessCode && (
                      <>
                        <span>•</span>
                        <span className="font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-800">
                          ID: {session.accessCode}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <a
                  href={session.meetingUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-6 py-3 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-md transition shrink-0 self-start md:self-auto cursor-pointer"
                >
                  <Video className="w-4 h-4" />
                  <span>Entrar na Sala Virtual</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SESSÕES AGENDADAS & GRAVADAS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Próximas Aulas Agendadas */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-1">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-600" />
              Próximas Sessões Remotas
            </h3>
            <span className="text-xs text-slate-400 font-medium">{upcomingSessions.length} agendada(s)</span>
          </div>

          <div className="space-y-3">
            {upcomingSessions.map(session => (
              <div
                key={session.id}
                className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded text-[11px] font-bold">
                    {session.platform}
                  </span>
                  <span className="text-xs text-slate-500 font-mono">
                    {session.scheduledDateTime}
                  </span>
                </div>

                <h4 className="text-xs font-bold text-slate-900 leading-snug">{session.title}</h4>
                <p className="text-[11px] text-slate-500 line-clamp-2">{session.summary}</p>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px]">
                  <span className="text-slate-600 truncate">{session.teacherName}</span>
                  <span className="text-indigo-600 font-semibold">{session.durationMinutes} min</span>
                </div>
              </div>
            ))}
          </div>

          {/* Dúvida Rápida com o Formador */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-3">
            <h4 className="text-xs font-bold text-slate-900 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-emerald-600" />
              Enviar Dúvida sobre a Aula Online
            </h4>
            <p className="text-[11px] text-slate-500">
              O docente responderá durante a próxima aula síncrona ou por mensagem interna.
            </p>

            {doubtSuccess ? (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Sua dúvida foi encaminhada ao corpo docente!</span>
              </div>
            ) : (
              <form onSubmit={handleSendDoubt} className="space-y-2">
                <textarea
                  rows={2}
                  value={doubtText}
                  onChange={e => setDoubtText(e.target.value)}
                  placeholder="Escreva sua dúvida sobre o conteúdo ministrado..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <button
                  type="submit"
                  className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition"
                >
                  <Send className="w-3 h-3" />
                  <span>Enviar Dúvida ao Formador</span>
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Acervo de Aulas Gravadas */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between pb-1">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Play className="w-4 h-4 text-emerald-600" />
              Acervo de Aulas Gravadas (Sob Demanda)
            </h3>
            <span className="text-xs text-slate-400 font-medium">Repositório Oficial Moztechwave</span>
          </div>

          <div className="space-y-4">
            {recordedSessions.map(session => (
              <div
                key={session.id}
                className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs hover:border-slate-300 transition space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block">
                      {session.disciplineName}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 mt-0.5">{session.title}</h4>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-xs font-mono font-medium">
                      {session.recordingDuration}
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelectedVideo(session)}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs transition cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Assistir Gravação</span>
                    </button>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">{session.summary}</p>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 text-[11px] text-slate-500">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3 text-slate-400" />
                      {session.teacherName}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      Gravada em {session.scheduledDateTime.split(' ')[0]}
                    </span>
                  </div>

                  <span className="text-emerald-700 font-semibold">
                    {session.materialsCount} material(is) associado(s)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Modal Player Simulado de Vídeo */}
      {selectedVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full overflow-hidden flex flex-col">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Play className="w-4 h-4 text-emerald-400 fill-current" />
                <h3 className="text-xs font-bold truncate max-w-md">{selectedVideo.title}</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedVideo(null)}
                className="text-slate-400 hover:text-white text-xs font-bold px-2 py-1 rounded hover:bg-slate-800"
              >
                Fechar
              </button>
            </div>

            {/* Tela Simulada de Reprodução */}
            <div className="bg-slate-950 aspect-video flex flex-col items-center justify-center text-white p-6 text-center relative">
              <div className="w-16 h-16 rounded-full bg-emerald-600/90 flex items-center justify-center shadow-lg mb-3 cursor-pointer hover:scale-105 transition">
                <Play className="w-8 h-8 fill-white ml-1" />
              </div>
              <p className="text-sm font-bold">{selectedVideo.disciplineName}</p>
              <p className="text-xs text-slate-400 mt-1">Duração: {selectedVideo.recordingDuration} • Servidor CDN Moztechwave</p>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
              <span>Docente: {selectedVideo.teacherName}</span>
              <button
                type="button"
                onClick={() => setSelectedVideo(null)}
                className="px-4 py-1.5 bg-slate-900 text-white rounded-xl text-xs font-semibold"
              >
                Concluir Reprodução
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
