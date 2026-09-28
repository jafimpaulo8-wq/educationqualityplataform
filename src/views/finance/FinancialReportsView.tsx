import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  FileSpreadsheet, 
  Printer, 
  Download, 
  Filter, 
  Search, 
  Calendar, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  Building, 
  Receipt, 
  AlertTriangle, 
  Coins, 
  ArrowUpRight, 
  ArrowDownLeft, 
  CheckCircle2, 
  AlertCircle,
  Briefcase,
  FileText,
  Clock,
  ArrowRightLeft,
  ChevronDown
} from 'lucide-react';
import { exportToCsv } from '../../utils/csvExport';

export type ReportType = 
  | 'recebido_aluno'
  | 'pendente_aluno'
  | 'inadimplentes'
  | 'receitas_mes'
  | 'despesas_mes'
  | 'saldo_anual'
  | 'despesas_fornecedor'
  | 'despesas_funcionario'
  | 'caixa_sessoes'
  | 'movimentos_caixa'
  | 'sangrias'
  | 'contas_receber'
  | 'contas_pagar';

interface ReportOption {
  id: ReportType;
  label: string;
  category: 'Alunos & Cobrança' | 'DRE & Balanço' | 'Despesas' | 'Caixa & Tesouraria' | 'Títulos';
  description: string;
}

const REPORT_OPTIONS: ReportOption[] = [
  // Alunos & Cobrança
  { id: 'recebido_aluno', label: 'Total Recebido por Aluno', category: 'Alunos & Cobrança', description: 'Valores já quitados por cada estudante (propinas, matrículas e serviços)' },
  { id: 'pendente_aluno', label: 'Total Pendente por Aluno', category: 'Alunos & Cobrança', description: 'Soma das obrigações a vencer e em aberto por estudante' },
  { id: 'inadimplentes', label: 'Inadimplentes (Em Atraso)', category: 'Alunos & Cobrança', description: 'Relação de alunos com pagamentos vencidos, dias de atraso e contato' },

  // DRE & Balanço
  { id: 'receitas_mes', label: 'Receitas por Mês', category: 'DRE & Balanço', description: 'Demonstrativo mensal consolidado de todas as entradas e arrecadações' },
  { id: 'despesas_mes', label: 'Despesas por Mês', category: 'DRE & Balanço', description: 'Demonstrativo mensal consolidado de todas as saídas e gastos' },
  { id: 'saldo_anual', label: 'Saldo Anual (Receitas vs Despesas)', category: 'DRE & Balanço', description: 'Balanço comparativo de superávit/déficit e margem operacional líquida' },

  // Despesas
  { id: 'despesas_fornecedor', label: 'Despesas por Fornecedor', category: 'Despesas', description: 'Total pago e compromissos futuros por fornecedor ou prestador externo' },
  { id: 'despesas_funcionario', label: 'Despesas por Funcionário', category: 'Despesas', description: 'Folha salarial, remunerações de formadores, ajudas de custo e gratificações' },

  // Caixa & Tesouraria
  { id: 'caixa_sessoes', label: 'Relatório de Caixa & Quebras', category: 'Caixa & Tesouraria', description: 'Histórico de aberturas, fechos, saldos esperados, informados e quebras' },
  { id: 'movimentos_caixa', label: 'Extrato de Movimentos de Caixa', category: 'Caixa & Tesouraria', description: 'Detalhamento cronológico de cada entrada, saída, sangria e reforço' },
  { id: 'sangrias', label: 'Relatório de Sangrias para Cofre', category: 'Caixa & Tesouraria', description: 'Recolhimentos de segurança de valores para guarda em cofre central' },

  // Títulos
  { id: 'contas_receber', label: 'Contas a Receber Geral', category: 'Títulos', description: 'Carteira completa de títulos a receber por categoria, turma e vencimento' },
  { id: 'contas_pagar', label: 'Contas a Pagar Geral', category: 'Títulos', description: 'Cronograma completo de contas a pagar por rubrica e vencimento' }
];

const MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

export const FinancialReportsView: React.FC = () => {
  const { 
    contasReceber, 
    contasPagar, 
    students, 
    teachers, 
    cashSessions, 
    activeCashSession,
    paymentRecords,
    activeInstitution 
  } = useApp();

  const [selectedReport, setSelectedReport] = useState<ReportType>('saldo_anual');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedYear, setSelectedYear] = useState('2026');

  // Combinar sessões de caixa (ativa + histórico)
  const allSessions = useMemo(() => {
    const map = new Map();
    if (activeCashSession) {
      map.set(activeCashSession.id, activeCashSession);
    }
    cashSessions.forEach(s => map.set(s.id, s));
    return Array.from(map.values());
  }, [activeCashSession, cashSessions]);

  // Todas as transações de caixa combinadas
  const allCashMovements = useMemo(() => {
    const list: any[] = [];
    allSessions.forEach(s => {
      if (s.transactions) {
        s.transactions.forEach((tx: any) => {
          list.push({ ...tx, sessionId: s.id, sessionOperator: s.operator });
        });
      }
    });
    return list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [allSessions]);

  // 1. DADOS: Total Recebido por Aluno
  const reportRecebidoPorAluno = useMemo(() => {
    const map: Record<string, { studentId: string; studentName: string; studentCode: string; totalPaid: number; count: number; phone?: string; courseName?: string }> = {};

    contasReceber.forEach(cr => {
      if (cr.status === 'pago' || (cr.paidAmount && cr.paidAmount > 0)) {
        const key = cr.studentId || cr.studentName || 'Outros';
        const paid = cr.paidAmount || (cr.status === 'pago' ? cr.totalAmount : 0);
        if (!map[key]) {
          map[key] = {
            studentId: cr.studentId || '',
            studentName: cr.studentName || 'Não Informado',
            studentCode: cr.studentCode || 'N/A',
            totalPaid: 0,
            count: 0,
            phone: cr.debtorPhone,
            courseName: cr.courseName
          };
        }
        map[key].totalPaid += paid;
        map[key].count += 1;
      }
    });

    // Também considerar pagamentos aprovados do portal de pagamentos
    paymentRecords.forEach(p => {
      if (p.status === 'PAGO') {
        const key = p.studentId || p.studentName;
        if (!map[key]) {
          map[key] = {
            studentId: p.studentId,
            studentName: p.studentName,
            studentCode: p.studentCode,
            totalPaid: 0,
            count: 0,
            phone: p.studentPhone,
            courseName: p.courseName
          };
        }
        map[key].totalPaid += p.amount;
        map[key].count += 1;
      }
    });

    return Object.values(map).sort((a, b) => b.totalPaid - a.totalPaid);
  }, [contasReceber, paymentRecords]);

  // 2. DADOS: Total Pendente por Aluno
  const reportPendentePorAluno = useMemo(() => {
    const map: Record<string, { studentId: string; studentName: string; studentCode: string; totalPending: number; pendingCount: number; phone?: string; courseName?: string }> = {};

    contasReceber.forEach(cr => {
      if (cr.status === 'pendente' || cr.status === 'atrasado' || cr.status === 'parcial') {
        const pending = Math.max(0, cr.totalAmount - (cr.paidAmount || 0));
        if (pending > 0) {
          const key = cr.studentId || cr.studentName || 'Outros';
          if (!map[key]) {
            map[key] = {
              studentId: cr.studentId || '',
              studentName: cr.studentName || 'Não Informado',
              studentCode: cr.studentCode || 'N/A',
              totalPending: 0,
              pendingCount: 0,
              phone: cr.debtorPhone,
              courseName: cr.courseName
            };
          }
          map[key].totalPending += pending;
          map[key].pendingCount += 1;
        }
      }
    });

    return Object.values(map).sort((a, b) => b.totalPending - a.totalPending);
  }, [contasReceber]);

  // 3. DADOS: Inadimplentes
  const reportInadimplentes = useMemo(() => {
    return contasReceber
      .filter(cr => cr.status === 'atrasado' || (cr.status === 'pendente' && new Date(cr.dueDate) < new Date()))
      .map(cr => {
        const dueDate = new Date(cr.dueDate);
        const today = new Date();
        const diffDays = Math.max(0, Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)));
        const pendingAmount = Math.max(0, cr.totalAmount - (cr.paidAmount || 0));
        return {
          id: cr.id,
          studentName: cr.studentName || cr.debtorName || 'Não Informado',
          studentCode: cr.studentCode || 'N/A',
          courseName: cr.courseName || cr.classGroupName || 'Geral',
          dueDate: cr.dueDate,
          diffDays,
          amount: pendingAmount,
          description: cr.description,
          phone: cr.debtorPhone
        };
      })
      .sort((a, b) => b.diffDays - a.diffDays);
  }, [contasReceber]);

  // 4 & 5 & 6. DADOS: Mensal (Receitas, Despesas e Saldo Anual)
  const reportMensal = useMemo(() => {
    return MESES.map((mes, index) => {
      const monthNum = (index + 1).toString().padStart(2, '0');
      
      // Receitas do mês
      const recContas = contasReceber
        .filter(cr => cr.status === 'pago' && (cr.paymentDate?.includes(`-${monthNum}-`) || cr.issueDate?.includes(`-${monthNum}-`)))
        .reduce((sum, cr) => sum + (cr.paidAmount || cr.totalAmount), 0);

      const recPortal = paymentRecords
        .filter(p => p.status === 'PAGO' && p.date?.includes(`-${monthNum}-`))
        .reduce((sum, p) => sum + p.amount, 0);

      const receitas = recContas + recPortal;

      // Despesas do mês
      const despesas = contasPagar
        .filter(cp => cp.status === 'pago' && (cp.paymentDate?.includes(`-${monthNum}-`) || cp.data?.includes(`-${monthNum}-`)))
        .reduce((sum, cp) => sum + cp.valor, 0);

      const saldo = receitas - despesas;
      const margem = receitas > 0 ? ((saldo / receitas) * 100).toFixed(1) : '0';

      return {
        mes,
        mesIndex: index,
        receitas,
        despesas,
        saldo,
        margem
      };
    });
  }, [contasReceber, paymentRecords, contasPagar]);

  // 7. DADOS: Despesas por Fornecedor
  const reportDespesasPorFornecedor = useMemo(() => {
    const map: Record<string, { fornecedor: string; totalPago: number; totalPendente: number; count: number; categorias: Set<string> }> = {};

    contasPagar
      .filter(cp => cp.targetType === 'fornecedor')
      .forEach(cp => {
        const nome = cp.fornecedor || 'Fornecedor Não Identificado';
        if (!map[nome]) {
          map[nome] = {
            fornecedor: nome,
            totalPago: 0,
            totalPendente: 0,
            count: 0,
            categorias: new Set()
          };
        }
        if (cp.status === 'pago') {
          map[nome].totalPago += cp.valor;
        } else {
          map[nome].totalPendente += cp.valor;
        }
        map[nome].count += 1;
        if (cp.categoria) map[nome].categorias.add(cp.categoria);
      });

    return Object.values(map)
      .map(item => ({
        ...item,
        categoriasStr: Array.from(item.categorias).join(', ') || 'Geral'
      }))
      .sort((a, b) => (b.totalPago + b.totalPendente) - (a.totalPago + a.totalPendente));
  }, [contasPagar]);

  // 8. DADOS: Despesas por Funcionário
  const reportDespesasPorFuncionario = useMemo(() => {
    const map: Record<string, { funcionario: string; totalPago: number; totalPendente: number; count: number; categorias: Set<string> }> = {};

    contasPagar
      .filter(cp => cp.targetType === 'funcionario')
      .forEach(cp => {
        const nome = cp.funcionario || 'Colaborador Não Identificado';
        if (!map[nome]) {
          map[nome] = {
            funcionario: nome,
            totalPago: 0,
            totalPendente: 0,
            count: 0,
            categorias: new Set()
          };
        }
        if (cp.status === 'pago') {
          map[nome].totalPago += cp.valor;
        } else {
          map[nome].totalPendente += cp.valor;
        }
        map[nome].count += 1;
        if (cp.categoria) map[nome].categorias.add(cp.categoria);
      });

    return Object.values(map)
      .map(item => ({
        ...item,
        categoriasStr: Array.from(item.categorias).join(', ') || 'Salários'
      }))
      .sort((a, b) => (b.totalPago + b.totalPendente) - (a.totalPago + a.totalPendente));
  }, [contasPagar]);

  // 9. DADOS: Sessões de Caixa
  const reportCaixaSessoes = useMemo(() => {
    return allSessions.map(s => {
      const dif = s.differenceAmount !== undefined 
        ? s.differenceAmount 
        : (s.reportedBalance !== undefined && s.expectedBalance !== undefined ? s.reportedBalance - s.expectedBalance : 0);
      return {
        id: s.id,
        operator: s.operator,
        openedAt: s.openedAt,
        closedAt: s.closedAt || 'Em Aberto',
        status: s.status,
        openingBalance: s.openingBalance,
        totalEntradas: s.totalEntradas || s.transactions?.filter(t => t.type === 'entrada').reduce((a, b) => a + b.amount, 0) || 0,
        totalReforcos: s.totalReforcos || s.transactions?.filter(t => t.type === 'reforco').reduce((a, b) => a + b.amount, 0) || 0,
        totalSaidas: s.totalSaidas || s.transactions?.filter(t => t.type === 'saida').reduce((a, b) => a + b.amount, 0) || 0,
        totalSangrias: s.totalSangrias || s.transactions?.filter(t => t.type === 'sangria').reduce((a, b) => a + b.amount, 0) || 0,
        expectedBalance: s.expectedBalance !== undefined ? s.expectedBalance : s.currentBalance,
        reportedBalance: s.reportedBalance !== undefined ? s.reportedBalance : s.currentBalance,
        differenceAmount: dif,
        closingNotes: s.closingNotes || ''
      };
    });
  }, [allSessions]);

  // 10. DADOS: Movimentos de Caixa
  const reportMovimentos = useMemo(() => {
    return allCashMovements;
  }, [allCashMovements]);

  // 11. DADOS: Sangrias de Caixa
  const reportSangrias = useMemo(() => {
    return allCashMovements.filter(m => m.type === 'sangria');
  }, [allCashMovements]);

  // 12. DADOS: Contas a Receber
  const reportContasReceber = useMemo(() => {
    return contasReceber;
  }, [contasReceber]);

  // 13. DADOS: Contas a Pagar
  const reportContasPagar = useMemo(() => {
    return contasPagar;
  }, [contasPagar]);

  // EXPORTAÇÃO EXCEL/CSV
  const handleExportCsv = () => {
    const today = new Date().toISOString().slice(0, 10);
    const instName = activeInstitution.name.replace(/[^a-zA-Z0-9]/g, '_');

    if (selectedReport === 'recebido_aluno') {
      const rows: (string | number)[][] = [
        ['RELATÓRIO: TOTAL RECEBIDO POR ALUNO'],
        [`INSTITUIÇÃO: ${activeInstitution.name}`, `NUIT: ${activeInstitution.nuit}`],
        [`DATA DE EMISSÃO: ${new Date().toLocaleString('pt-MZ')}`],
        [],
        ['Código', 'Nome do Aluno', 'Curso / Turma', 'Telefone', 'Qtd Pagamentos', 'Total Pago (MZN)']
      ];
      reportRecebidoPorAluno.forEach(r => {
        rows.push([r.studentCode, r.studentName, r.courseName || '', r.phone || '', r.count, r.totalPaid.toFixed(2)]);
      });
      exportToCsv(`Relatorio_Recebido_Alunos_${instName}_${today}`, rows);
    } else if (selectedReport === 'pendente_aluno') {
      const rows: (string | number)[][] = [
        ['RELATÓRIO: TOTAL PENDENTE POR ALUNO'],
        [`INSTITUIÇÃO: ${activeInstitution.name}`],
        [],
        ['Código', 'Nome do Aluno', 'Curso / Turma', 'Telefone', 'Títulos Pendentes', 'Total Pendente (MZN)']
      ];
      reportPendentePorAluno.forEach(r => {
        rows.push([r.studentCode, r.studentName, r.courseName || '', r.phone || '', r.pendingCount, r.totalPending.toFixed(2)]);
      });
      exportToCsv(`Relatorio_Pendente_Alunos_${instName}_${today}`, rows);
    } else if (selectedReport === 'inadimplentes') {
      const rows: (string | number)[][] = [
        ['RELATÓRIO DE ALUNOS INADIMPLENTES'],
        [`INSTITUIÇÃO: ${activeInstitution.name}`],
        [],
        ['Aluno', 'Código', 'Curso', 'Descrição da Dívida', 'Vencimento', 'Dias em Atraso', 'Valor Devedor (MZN)', 'Telefone']
      ];
      reportInadimplentes.forEach(r => {
        rows.push([r.studentName, r.studentCode, r.courseName, r.description, r.dueDate, r.diffDays, r.amount.toFixed(2), r.phone || '']);
      });
      exportToCsv(`Relatorio_Inadimplentes_${instName}_${today}`, rows);
    } else if (selectedReport === 'saldo_anual' || selectedReport === 'receitas_mes' || selectedReport === 'despesas_mes') {
      const rows: (string | number)[][] = [
        ['DEMONSTRATIVO FINANCEIRO ANUAL (DRE)'],
        [`INSTITUIÇÃO: ${activeInstitution.name}`, `ANO: ${selectedYear}`],
        [],
        ['Mês', 'Receitas Realizadas (MZN)', 'Despesas Pagas (MZN)', 'Saldo Líquido (MZN)', 'Margem (%)']
      ];
      reportMensal.forEach(m => {
        rows.push([m.mes, m.receitas.toFixed(2), m.despesas.toFixed(2), m.saldo.toFixed(2), `${m.margem}%`]);
      });
      exportToCsv(`Relatorio_DRE_Anual_${instName}_${today}`, rows);
    } else if (selectedReport === 'despesas_fornecedor') {
      const rows: (string | number)[][] = [
        ['RELATÓRIO DE DESPESAS POR FORNECEDOR'],
        [`INSTITUIÇÃO: ${activeInstitution.name}`],
        [],
        ['Fornecedor', 'Categorias', 'Qtd Despesas', 'Total Pago (MZN)', 'Total Pendente (MZN)', 'Total Geral (MZN)']
      ];
      reportDespesasPorFornecedor.forEach(f => {
        rows.push([f.fornecedor, f.categoriasStr, f.count, f.totalPago.toFixed(2), f.totalPendente.toFixed(2), (f.totalPago + f.totalPendente).toFixed(2)]);
      });
      exportToCsv(`Relatorio_Despesas_Fornecedores_${instName}_${today}`, rows);
    } else if (selectedReport === 'despesas_funcionario') {
      const rows: (string | number)[][] = [
        ['RELATÓRIO DE DESPESAS POR FUNCIONÁRIO / FORMADOR'],
        [`INSTITUIÇÃO: ${activeInstitution.name}`],
        [],
        ['Funcionário / Docente', 'Categorias / Rubricas', 'Lançamentos', 'Total Pago (MZN)', 'Total a Pagar (MZN)', 'Total Geral (MZN)']
      ];
      reportDespesasPorFuncionario.forEach(func => {
        rows.push([func.funcionario, func.categoriasStr, func.count, func.totalPago.toFixed(2), func.totalPendente.toFixed(2), (func.totalPago + func.totalPendente).toFixed(2)]);
      });
      exportToCsv(`Relatorio_Despesas_Funcionarios_${instName}_${today}`, rows);
    } else if (selectedReport === 'caixa_sessoes') {
      const rows = [
        ['RELATÓRIO DE FECHO DE CAIXA E QUEBRAS'],
        [`INSTITUIÇÃO: ${activeInstitution.name}`],
        [],
        ['Sessão ID', 'Operador', 'Abertura', 'Fecho', 'Status', 'Saldo Inicial', 'Entradas', 'Saídas', 'Sangrias', 'Saldo Esperado', 'Saldo Informado', 'Quebra / Diferença', 'Observações']
      ];
      reportCaixaSessoes.forEach(s => {
        rows.push([s.id, s.operator, s.openedAt, s.closedAt, s.status, s.openingBalance.toFixed(2), s.totalEntradas.toFixed(2), s.totalSaidas.toFixed(2), s.totalSangrias.toFixed(2), s.expectedBalance.toFixed(2), s.reportedBalance.toFixed(2), s.differenceAmount.toFixed(2), s.closingNotes]);
      });
      exportToCsv(`Relatorio_Caixa_Sessoes_${instName}_${today}`, rows);
    } else if (selectedReport === 'movimentos_caixa') {
      const rows = [
        ['EXTRATO GERAL DE MOVIMENTAÇÕES DE CAIXA'],
        [`INSTITUIÇÃO: ${activeInstitution.name}`],
        [],
        ['Data/Hora', 'Tipo', 'Referência', 'Descrição', 'Motivo', 'Operador', 'Forma Pagto', 'Valor (MZN)']
      ];
      reportMovimentos.forEach(m => {
        rows.push([`${m.date || ''} ${m.time || m.timestamp}`, m.type, m.documentRef || m.id, m.description, m.reason || '', m.operator, m.paymentMethod, m.amount.toFixed(2)]);
      });
      exportToCsv(`Relatorio_Movimentos_Caixa_${instName}_${today}`, rows);
    } else if (selectedReport === 'sangrias') {
      const rows = [
        ['RELATÓRIO DE SANGRIAS DE CAIXA PARA COFRE'],
        [`INSTITUIÇÃO: ${activeInstitution.name}`],
        [],
        ['Data/Hora', 'Referência', 'Descrição', 'Motivo da Retirada', 'Operador Responsável', 'Valor Sangrado (MZN)']
      ];
      reportSangrias.forEach(s => {
        rows.push([`${s.date || ''} ${s.time || s.timestamp}`, s.documentRef || s.id, s.description, s.reason || 'Recolha para cofre', s.operator, s.amount.toFixed(2)]);
      });
      exportToCsv(`Relatorio_Sangrias_Cofre_${instName}_${today}`, rows);
    } else if (selectedReport === 'contas_receber') {
      const rows = [
        ['RELATÓRIO DE CONTAS A RECEBER'],
        [`INSTITUIÇÃO: ${activeInstitution.name}`],
        [],
        ['ID', 'Categoria', 'Descrição', 'Aluno / Devedor', 'Vencimento', 'Estado', 'Valor Total (MZN)', 'Valor Pago (MZN)', 'Saldo Devedor (MZN)']
      ];
      reportContasReceber.forEach(cr => {
        rows.push([cr.id, cr.category, cr.description, cr.studentName || cr.debtorName || '', cr.dueDate, cr.status, cr.totalAmount.toFixed(2), (cr.paidAmount || 0).toFixed(2), Math.max(0, cr.totalAmount - (cr.paidAmount || 0)).toFixed(2)]);
      });
      exportToCsv(`Relatorio_Contas_Receber_${instName}_${today}`, rows);
    } else if (selectedReport === 'contas_pagar') {
      const rows = [
        ['RELATÓRIO DE CONTAS A PAGAR'],
        [`INSTITUIÇÃO: ${activeInstitution.name}`],
        [],
        ['ID', 'Favorecido', 'Tipo', 'Despesa', 'Categoria', 'Vencimento', 'Estado', 'Valor (MZN)', 'Forma Pagto']
      ];
      reportContasPagar.forEach(cp => {
        rows.push([cp.id, cp.fornecedor || cp.funcionario || '', cp.targetType, cp.despesa, cp.categoria, cp.data, cp.status, cp.valor.toFixed(2), cp.paymentMethod || '']);
      });
      exportToCsv(`Relatorio_Contas_Pagar_${instName}_${today}`, rows);
    }
  };

  const currentReportObj = REPORT_OPTIONS.find(r => r.id === selectedReport);

  return (
    <div id="financial-reports-container" className="space-y-6">
      
      {/* Top Header Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4 print:hidden">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-slate-900 text-white shadow-xs">
            <FileSpreadsheet className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-slate-900 tracking-tight">Central de Relatórios Financeiros</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300">
                Módulo 34
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Demonstrativos contábeis, apuração de receitas, despesas, caixa e auditoria • {activeInstitution.name}
            </p>
          </div>
        </div>

        {/* Botões de Exportação / Impressão */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleExportCsv}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer active:scale-95"
            title="Exportar dados do relatório para arquivo CSV/Excel"
          >
            <Download className="w-4 h-4" />
            Exportar Excel / CSV
          </button>

          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer active:scale-95"
            title="Imprimir ou salvar como PDF"
          >
            <Printer className="w-4 h-4 text-emerald-400" />
            Imprimir / Salvar PDF
          </button>
        </div>
      </div>

      {/* Seletor de Tipo de Relatório (Agrupado) */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs print:hidden space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase text-slate-500 tracking-wider">
            Selecione o Relatório Financeiro Desejado:
          </span>
          <span className="text-xs text-slate-400">13 relatórios homologados disponíveis</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
          {REPORT_OPTIONS.map(opt => (
            <button
              key={opt.id}
              onClick={() => setSelectedReport(opt.id)}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                selectedReport === opt.id
                  ? 'bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-emerald-400/20'
                  : 'bg-slate-50/70 hover:bg-slate-100 text-slate-700 border-slate-200'
              }`}
            >
              <div>
                <span className={`text-[9px] font-black uppercase tracking-wider block mb-0.5 ${
                  selectedReport === opt.id ? 'text-emerald-400' : 'text-slate-400'
                }`}>
                  {opt.category}
                </span>
                <p className="font-bold text-xs leading-snug line-clamp-1">{opt.label}</p>
              </div>
              <p className={`text-[10px] mt-1 line-clamp-2 ${
                selectedReport === opt.id ? 'text-slate-300' : 'text-slate-500'
              }`}>
                {opt.description}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* CABEÇALHO OFICIAL PARA IMPRESSÃO (Visível na impressão A4) */}
      <div className="hidden print:block border-b-2 border-slate-900 pb-4 mb-6 text-center">
        <div className="flex items-center justify-center gap-3">
          {activeInstitution.logoUrl && (
            <img src={activeInstitution.logoUrl} alt="Logo" className="w-12 h-12 object-contain" referrerPolicy="no-referrer" />
          )}
          <div>
            <h1 className="text-base font-black uppercase text-slate-900">{activeInstitution.name}</h1>
            <p className="text-[10px] text-slate-600">
              {activeInstitution.address} • NUIT: {activeInstitution.nuit} • Telefone: {activeInstitution.phone}
            </p>
          </div>
        </div>
        <div className="mt-3">
          <h2 className="text-sm font-black uppercase tracking-wider text-slate-900">
            {currentReportObj?.label.toUpperCase()}
          </h2>
          <p className="text-[10px] text-slate-500 font-mono">
            Emitido em: {new Date().toLocaleString('pt-MZ')} • SIVERC SIGAR Financeiro
          </p>
        </div>
      </div>

      {/* CORPO DO RELATÓRIO ATIVO */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden print:border-none print:shadow-none">
        
        {/* Sub-header do relatório ativo com busca e totalizador */}
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-slate-50/50 print:hidden">
          <div>
            <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-600" />
              {currentReportObj?.label}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">{currentReportObj?.description}</p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Filtrar dados..."
                className="pl-8 pr-3 py-1.5 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-slate-900 w-48 sm:w-60 bg-white"
              />
            </div>
          </div>
        </div>

        {/* 1. RELATÓRIO: Total Recebido por Aluno */}
        {selectedReport === 'recebido_aluno' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="p-3">Código</th>
                  <th className="p-3">Nome do Formando</th>
                  <th className="p-3">Curso / Turma</th>
                  <th className="p-3">Contacto</th>
                  <th className="p-3 text-center">Títulos Pagos</th>
                  <th className="p-3 text-right">Total Quitado (MZN)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reportRecebidoPorAluno
                  .filter(r => !searchQuery || r.studentName.toLowerCase().includes(searchQuery.toLowerCase()) || r.studentCode.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map(r => (
                    <tr key={r.studentId || r.studentName} className="hover:bg-slate-50">
                      <td className="p-3 font-mono font-bold text-slate-700">{r.studentCode}</td>
                      <td className="p-3 font-bold text-slate-900">{r.studentName}</td>
                      <td className="p-3 text-slate-600">{r.courseName || 'Geral'}</td>
                      <td className="p-3 text-slate-600 font-mono">{r.phone || '—'}</td>
                      <td className="p-3 text-center">
                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full font-bold text-[10px]">
                          {r.count} títulos
                        </span>
                      </td>
                      <td className="p-3 text-right font-mono font-black text-emerald-600">
                        {r.totalPaid.toLocaleString('pt-MZ', { minimumFractionDigits: 2 })} MT
                      </td>
                    </tr>
                  ))}
              </tbody>
              <tfoot className="bg-slate-900 text-white font-bold">
                <tr>
                  <td colSpan={5} className="p-3 text-right uppercase text-[11px]">Total Geral Arrecadado:</td>
                  <td className="p-3 text-right font-mono text-emerald-400 font-black text-sm">
                    {reportRecebidoPorAluno.reduce((a, b) => a + b.totalPaid, 0).toLocaleString('pt-MZ', { minimumFractionDigits: 2 })} MT
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}

        {/* 2. RELATÓRIO: Total Pendente por Aluno */}
        {selectedReport === 'pendente_aluno' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="p-3">Código</th>
                  <th className="p-3">Nome do Aluno</th>
                  <th className="p-3">Curso / Turma</th>
                  <th className="p-3">Contacto</th>
                  <th className="p-3 text-center">Títulos Pendentes</th>
                  <th className="p-3 text-right">Total a Pagar (MZN)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reportPendentePorAluno
                  .filter(r => !searchQuery || r.studentName.toLowerCase().includes(searchQuery.toLowerCase()) || r.studentCode.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map(r => (
                    <tr key={r.studentId || r.studentName} className="hover:bg-slate-50">
                      <td className="p-3 font-mono font-bold text-slate-700">{r.studentCode}</td>
                      <td className="p-3 font-bold text-slate-900">{r.studentName}</td>
                      <td className="p-3 text-slate-600">{r.courseName || 'Geral'}</td>
                      <td className="p-3 text-slate-600 font-mono">{r.phone || '—'}</td>
                      <td className="p-3 text-center">
                        <span className="px-2 py-0.5 bg-amber-50 text-amber-700 rounded-full font-bold text-[10px]">
                          {r.pendingCount} títulos
                        </span>
                      </td>
                      <td className="p-3 text-right font-mono font-black text-amber-600">
                        {r.totalPending.toLocaleString('pt-MZ', { minimumFractionDigits: 2 })} MT
                      </td>
                    </tr>
                  ))}
              </tbody>
              <tfoot className="bg-slate-900 text-white font-bold">
                <tr>
                  <td colSpan={5} className="p-3 text-right uppercase text-[11px]">Total em Aberto na Carteira:</td>
                  <td className="p-3 text-right font-mono text-amber-400 font-black text-sm">
                    {reportPendentePorAluno.reduce((a, b) => a + b.totalPending, 0).toLocaleString('pt-MZ', { minimumFractionDigits: 2 })} MT
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}

        {/* 3. RELATÓRIO: Inadimplentes */}
        {selectedReport === 'inadimplentes' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="p-3">Aluno</th>
                  <th className="p-3">Curso / Turma</th>
                  <th className="p-3">Descrição da Dívida</th>
                  <th className="p-3">Vencimento</th>
                  <th className="p-3 text-center">Atraso</th>
                  <th className="p-3">Contacto</th>
                  <th className="p-3 text-right">Valor em Dívida (MZN)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reportInadimplentes
                  .filter(r => !searchQuery || r.studentName.toLowerCase().includes(searchQuery.toLowerCase()) || r.studentCode.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map(r => (
                    <tr key={r.id} className="hover:bg-slate-50">
                      <td className="p-3">
                        <p className="font-bold text-slate-900">{r.studentName}</p>
                        <p className="font-mono text-[10px] text-slate-500">ID: {r.studentCode}</p>
                      </td>
                      <td className="p-3 text-slate-600">{r.courseName}</td>
                      <td className="p-3 text-slate-700 font-medium">{r.description}</td>
                      <td className="p-3 font-mono text-slate-600">{r.dueDate}</td>
                      <td className="p-3 text-center">
                        <span className="px-2 py-0.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-full font-black text-[10px]">
                          {r.diffDays} dias
                        </span>
                      </td>
                      <td className="p-3 font-mono text-slate-600">{r.phone || '—'}</td>
                      <td className="p-3 text-right font-mono font-black text-rose-600">
                        {r.amount.toLocaleString('pt-MZ', { minimumFractionDigits: 2 })} MT
                      </td>
                    </tr>
                  ))}
                {reportInadimplentes.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-slate-400">
                      Parabéns! Nenhum formando com parcelas em atraso no momento.
                    </td>
                  </tr>
                )}
              </tbody>
              <tfoot className="bg-slate-900 text-white font-bold">
                <tr>
                  <td colSpan={6} className="p-3 text-right uppercase text-[11px]">Total Inadimplente:</td>
                  <td className="p-3 text-right font-mono text-rose-400 font-black text-sm">
                    {reportInadimplentes.reduce((a, b) => a + b.amount, 0).toLocaleString('pt-MZ', { minimumFractionDigits: 2 })} MT
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}

        {/* 4 & 5 & 6. RELATÓRIO: Mensal (Receitas por Mês, Despesas por Mês, Saldo Anual) */}
        {(selectedReport === 'saldo_anual' || selectedReport === 'receitas_mes' || selectedReport === 'despesas_mes') && (
          <div className="p-4 sm:p-6 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                <span className="text-[10px] font-bold text-emerald-800 uppercase block">Total Receitas do Exercício</span>
                <span className="text-xl font-black text-emerald-700 font-mono">
                  {reportMensal.reduce((a, b) => a + b.receitas, 0).toLocaleString('pt-MZ', { minimumFractionDigits: 2 })} MT
                </span>
              </div>
              <div className="p-4 bg-rose-50 rounded-xl border border-rose-200">
                <span className="text-[10px] font-bold text-rose-800 uppercase block">Total Despesas do Exercício</span>
                <span className="text-xl font-black text-rose-700 font-mono">
                  {reportMensal.reduce((a, b) => a + b.despesas, 0).toLocaleString('pt-MZ', { minimumFractionDigits: 2 })} MT
                </span>
              </div>
              <div className="p-4 bg-slate-900 rounded-xl text-white">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Resultado Líquido / Saldo Anual</span>
                <span className="text-xl font-black text-emerald-400 font-mono">
                  {(reportMensal.reduce((a, b) => a + b.receitas, 0) - reportMensal.reduce((a, b) => a + b.despesas, 0)).toLocaleString('pt-MZ', { minimumFractionDigits: 2 })} MT
                </span>
              </div>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="p-3">Mês de Referência</th>
                    <th className="p-3 text-right">Receitas Realizadas (MZN)</th>
                    <th className="p-3 text-right">Despesas Liquidadas (MZN)</th>
                    <th className="p-3 text-right">Resultado / Saldo (MZN)</th>
                    <th className="p-3 text-right">Margem Operacional</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {reportMensal.map(m => (
                    <tr key={m.mes} className="hover:bg-slate-50 font-sans">
                      <td className="p-3 font-bold text-slate-900">{m.mes}</td>
                      <td className="p-3 text-right font-mono text-emerald-600 font-bold">
                        {m.receitas.toLocaleString('pt-MZ', { minimumFractionDigits: 2 })} MT
                      </td>
                      <td className="p-3 text-right font-mono text-rose-600 font-bold">
                        {m.despesas.toLocaleString('pt-MZ', { minimumFractionDigits: 2 })} MT
                      </td>
                      <td className={`p-3 text-right font-mono font-black ${
                        m.saldo >= 0 ? 'text-emerald-700' : 'text-rose-700'
                      }`}>
                        {m.saldo >= 0 ? '+' : ''}{m.saldo.toLocaleString('pt-MZ', { minimumFractionDigits: 2 })} MT
                      </td>
                      <td className="p-3 text-right font-mono text-slate-600">
                        {m.margem}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 7. RELATÓRIO: Despesas por Fornecedor */}
        {selectedReport === 'despesas_fornecedor' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="p-3">Razão Social / Fornecedor</th>
                  <th className="p-3">Categorias Contratadas</th>
                  <th className="p-3 text-center">Lançamentos</th>
                  <th className="p-3 text-right">Total Pago (MZN)</th>
                  <th className="p-3 text-right">A Liquidar (MZN)</th>
                  <th className="p-3 text-right">Volume Total (MZN)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reportDespesasPorFornecedor
                  .filter(f => !searchQuery || f.fornecedor.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map(f => (
                    <tr key={f.fornecedor} className="hover:bg-slate-50">
                      <td className="p-3 font-bold text-slate-900">{f.fornecedor}</td>
                      <td className="p-3 text-slate-600">{f.categoriasStr}</td>
                      <td className="p-3 text-center font-bold text-slate-700">{f.count}</td>
                      <td className="p-3 text-right font-mono font-bold text-emerald-600">
                        {f.totalPago.toLocaleString('pt-MZ', { minimumFractionDigits: 2 })} MT
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-rose-600">
                        {f.totalPendente.toLocaleString('pt-MZ', { minimumFractionDigits: 2 })} MT
                      </td>
                      <td className="p-3 text-right font-mono font-black text-slate-900">
                        {(f.totalPago + f.totalPendente).toLocaleString('pt-MZ', { minimumFractionDigits: 2 })} MT
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 8. RELATÓRIO: Despesas por Funcionário */}
        {selectedReport === 'despesas_funcionario' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="p-3">Nome do Colaborador / Formador</th>
                  <th className="p-3">Rubricas / Benefícios</th>
                  <th className="p-3 text-center">Registos</th>
                  <th className="p-3 text-right">Total Pago (MZN)</th>
                  <th className="p-3 text-right">Pendente (MZN)</th>
                  <th className="p-3 text-right">Total Remunerações (MZN)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reportDespesasPorFuncionario
                  .filter(func => !searchQuery || func.funcionario.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map(func => (
                    <tr key={func.funcionario} className="hover:bg-slate-50">
                      <td className="p-3 font-bold text-slate-900">{func.funcionario}</td>
                      <td className="p-3 text-slate-600">{func.categoriasStr}</td>
                      <td className="p-3 text-center font-bold text-slate-700">{func.count}</td>
                      <td className="p-3 text-right font-mono font-bold text-emerald-600">
                        {func.totalPago.toLocaleString('pt-MZ', { minimumFractionDigits: 2 })} MT
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-amber-600">
                        {func.totalPendente.toLocaleString('pt-MZ', { minimumFractionDigits: 2 })} MT
                      </td>
                      <td className="p-3 text-right font-mono font-black text-slate-900">
                        {(func.totalPago + func.totalPendente).toLocaleString('pt-MZ', { minimumFractionDigits: 2 })} MT
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 9. RELATÓRIO: Caixa & Quebras */}
        {selectedReport === 'caixa_sessoes' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="p-3">Sessão ID</th>
                  <th className="p-3">Operador</th>
                  <th className="p-3 text-right">Fundo Abertura</th>
                  <th className="p-3 text-right">Entradas</th>
                  <th className="p-3 text-right">Saídas/Sangrias</th>
                  <th className="p-3 text-right">Saldo Esperado</th>
                  <th className="p-3 text-right">Saldo Informado</th>
                  <th className="p-3 text-center">Quebra / Diferença</th>
                  <th className="p-3">Fecho</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {reportCaixaSessoes.map(s => (
                  <tr key={s.id} className="hover:bg-slate-50">
                    <td className="p-3 font-bold text-slate-900">{s.id}</td>
                    <td className="p-3 font-sans font-medium text-slate-800">{s.operator}</td>
                    <td className="p-3 text-right text-slate-700">{s.openingBalance.toLocaleString('pt-MZ')} MT</td>
                    <td className="p-3 text-right text-emerald-600 font-bold">+{s.totalEntradas.toLocaleString('pt-MZ')} MT</td>
                    <td className="p-3 text-right text-rose-600 font-bold">-{(s.totalSaidas + s.totalSangrias).toLocaleString('pt-MZ')} MT</td>
                    <td className="p-3 text-right font-black text-slate-900">{s.expectedBalance.toLocaleString('pt-MZ')} MT</td>
                    <td className="p-3 text-right font-bold text-slate-800">{s.reportedBalance.toLocaleString('pt-MZ')} MT</td>
                    <td className="p-3 text-center">
                      {s.differenceAmount === 0 ? (
                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full font-bold text-[10px]">
                          Exato (0 MT)
                        </span>
                      ) : s.differenceAmount < 0 ? (
                        <span className="px-2 py-0.5 bg-rose-50 text-rose-700 rounded-full font-bold text-[10px]">
                          Falta ({s.differenceAmount.toLocaleString('pt-MZ')} MT)
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-sky-50 text-sky-700 rounded-full font-bold text-[10px]">
                          Sobra (+{s.differenceAmount.toLocaleString('pt-MZ')} MT)
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-[10px] text-slate-500 font-sans">{s.closedAt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 10. RELATÓRIO: Movimentos de Caixa */}
        {selectedReport === 'movimentos_caixa' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="p-3">Data/Hora</th>
                  <th className="p-3">Tipo</th>
                  <th className="p-3">Ref</th>
                  <th className="p-3">Descrição / Motivo</th>
                  <th className="p-3">Operador</th>
                  <th className="p-3">Método</th>
                  <th className="p-3 text-right">Valor (MZN)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reportMovimentos.map((m, idx) => {
                  const isPlus = m.type === 'entrada' || m.type === 'reforco';
                  return (
                    <tr key={m.id || idx} className="hover:bg-slate-50">
                      <td className="p-3 font-mono text-slate-600">{m.date || ''} {m.time || m.timestamp}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                          isPlus ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                        }`}>
                          {m.type}
                        </span>
                      </td>
                      <td className="p-3 font-mono font-bold text-slate-700">{m.documentRef || m.id}</td>
                      <td className="p-3">
                        <p className="font-bold text-slate-900">{m.description}</p>
                        {m.reason && <p className="text-[10px] text-slate-500">Motivo: {m.reason}</p>}
                      </td>
                      <td className="p-3 text-slate-600 font-medium">{m.operator}</td>
                      <td className="p-3 text-slate-600">{m.paymentMethod}</td>
                      <td className={`p-3 text-right font-mono font-black ${isPlus ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {isPlus ? '+' : '-'}{m.amount.toLocaleString('pt-MZ', { minimumFractionDigits: 2 })} MT
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* 11. RELATÓRIO: Sangrias */}
        {selectedReport === 'sangrias' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="p-3">Data / Hora</th>
                  <th className="p-3">Referência</th>
                  <th className="p-3">Operador do Caixa</th>
                  <th className="p-3">Motivo / Finalidade</th>
                  <th className="p-3">Destino do Numerário</th>
                  <th className="p-3 text-right">Valor Sangrado (MZN)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reportSangrias.map((s, idx) => (
                  <tr key={s.id || idx} className="hover:bg-slate-50">
                    <td className="p-3 font-mono text-slate-600">{s.date || ''} {s.time || s.timestamp}</td>
                    <td className="p-3 font-mono font-bold text-amber-700">{s.documentRef || s.id}</td>
                    <td className="p-3 font-bold text-slate-900">{s.operator}</td>
                    <td className="p-3 text-slate-700">{s.reason || s.description}</td>
                    <td className="p-3 text-slate-600 font-medium">Cofre Central da Direção</td>
                    <td className="p-3 text-right font-mono font-black text-amber-700">
                      {s.amount.toLocaleString('pt-MZ', { minimumFractionDigits: 2 })} MT
                    </td>
                  </tr>
                ))}
                {reportSangrias.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-slate-400">
                      Nenhuma sangria realizada no período.
                    </td>
                  </tr>
                )}
              </tbody>
              <tfoot className="bg-slate-900 text-white font-bold">
                <tr>
                  <td colSpan={5} className="p-3 text-right uppercase text-[11px]">Total Recolhido em Sangrias:</td>
                  <td className="p-3 text-right font-mono text-amber-400 font-black text-sm">
                    {reportSangrias.reduce((a, b) => a + b.amount, 0).toLocaleString('pt-MZ', { minimumFractionDigits: 2 })} MT
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}

        {/* 12. RELATÓRIO: Contas a Receber */}
        {selectedReport === 'contas_receber' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="p-3">Categoria</th>
                  <th className="p-3">Descrição / Rubrica</th>
                  <th className="p-3">Aluno / Responsável</th>
                  <th className="p-3">Vencimento</th>
                  <th className="p-3 text-center">Estado</th>
                  <th className="p-3 text-right">Valor Total (MZN)</th>
                  <th className="p-3 text-right">Pago (MZN)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reportContasReceber
                  .filter(cr => !searchQuery || cr.description.toLowerCase().includes(searchQuery.toLowerCase()) || cr.studentName?.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map(cr => (
                    <tr key={cr.id} className="hover:bg-slate-50">
                      <td className="p-3 font-bold text-slate-700">{cr.category}</td>
                      <td className="p-3 font-bold text-slate-900">{cr.description}</td>
                      <td className="p-3 text-slate-700">{cr.studentName || cr.debtorName || 'N/A'}</td>
                      <td className="p-3 font-mono text-slate-600">{cr.dueDate}</td>
                      <td className="p-3 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          cr.status === 'pago' ? 'bg-emerald-50 text-emerald-700' :
                          cr.status === 'atrasado' ? 'bg-rose-50 text-rose-700' : 'bg-amber-50 text-amber-700'
                        }`}>
                          {cr.status}
                        </span>
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-slate-900">
                        {cr.totalAmount.toLocaleString('pt-MZ', { minimumFractionDigits: 2 })} MT
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-emerald-600">
                        {(cr.paidAmount || (cr.status === 'pago' ? cr.totalAmount : 0)).toLocaleString('pt-MZ', { minimumFractionDigits: 2 })} MT
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 13. RELATÓRIO: Contas a Pagar */}
        {selectedReport === 'contas_pagar' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="p-3">Tipo / Favorecido</th>
                  <th className="p-3">Descrição da Despesa</th>
                  <th className="p-3">Categoria</th>
                  <th className="p-3">Data / Vencimento</th>
                  <th className="p-3 text-center">Estado</th>
                  <th className="p-3 text-right">Valor da Despesa (MZN)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reportContasPagar
                  .filter(cp => !searchQuery || cp.despesa.toLowerCase().includes(searchQuery.toLowerCase()) || cp.fornecedor?.toLowerCase().includes(searchQuery.toLowerCase()) || cp.funcionario?.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map(cp => (
                    <tr key={cp.id} className="hover:bg-slate-50">
                      <td className="p-3 font-bold text-slate-900">{cp.fornecedor || cp.funcionario || 'Diversos'}</td>
                      <td className="p-3 text-slate-800">{cp.despesa}</td>
                      <td className="p-3 text-slate-600">{cp.categoria}</td>
                      <td className="p-3 font-mono text-slate-600">{cp.data}</td>
                      <td className="p-3 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          cp.status === 'pago' ? 'bg-emerald-50 text-emerald-700' :
                          cp.status === 'atrasado' ? 'bg-rose-50 text-rose-700' : 'bg-amber-50 text-amber-700'
                        }`}>
                          {cp.status}
                        </span>
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-rose-600">
                        {cp.valor.toLocaleString('pt-MZ', { minimumFractionDigits: 2 })} MT
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}

      </div>

      {/* ÁREA DE ASSINATURAS E CARIMBO OFICIAL NA IMPRESSÃO */}
      <div className="hidden print:grid grid-cols-3 gap-8 pt-12 text-center text-[10px] text-slate-700">
        <div>
          <div className="border-b border-slate-400 h-10 mb-1.5"></div>
          <p className="font-bold text-slate-900 uppercase">Elaborado por (Tesouraria)</p>
          <p>Responsável de Caixa / Contas</p>
        </div>
        <div>
          <div className="border-b border-slate-400 h-10 mb-1.5"></div>
          <p className="font-bold text-slate-900 uppercase">Verificado por (Contabilidade)</p>
          <p>Direção Administrativa e Financeira</p>
        </div>
        <div>
          <div className="border-b border-slate-400 h-10 mb-1.5"></div>
          <p className="font-bold text-slate-900 uppercase">Aprovado (Direção Geral)</p>
          <p>{activeInstitution.name}</p>
        </div>
      </div>

    </div>
  );
};
