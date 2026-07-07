import jsPDF from "jspdf";

export interface ClinicaInfo {
    nome?: string;
    cnpj?: string;
    endereco?: string;
    cidade?: string;
    cep?: string;
    telefone?: string;
    email?: string;
    especialidade?: string;
}

export interface MedicamentoPDF {
    medicamento: string;
    dosagem?: string;
    frequencia?: string;
    duracao?: string;
    viaAdministracao?: string;
    observacoes?: string;
    tipoReceita?: string;
}

export function gerarPrescricaoPDF(
    clinica: ClinicaInfo,
    pacienteNome: string,
    medicoNome: string,
    medicoCrm: string,
    dataConsulta: string,
    medicamentos: MedicamentoPDF[],
) {
    const doc = new jsPDF({ unit: "mm", format: "a4" });
    const MARGIN = 22;
    const PAGE_W = 210;
    const PAGE_H = 297;
    const CONTENT_W = PAGE_W - MARGIN * 2;
    const ROSA: [number, number, number] = [180, 90, 110];
    const CINZA_ESCURO: [number, number, number] = [50, 50, 50];
    const CINZA: [number, number, number] = [120, 120, 120];
    let y = MARGIN;

    const set = (size: number, bold: boolean, color: [number, number, number], italic = false) => {
        doc.setFontSize(size);
        doc.setFont("helvetica", italic ? "italic" : bold ? "bold" : "normal");
        doc.setTextColor(...color);
    };

    set(16, true, ROSA);
    doc.text(`Dr. ${medicoNome}`, MARGIN, y);
    y += 6;

    if (clinica.especialidade) {
        set(9, false, CINZA, true);
        doc.text(clinica.especialidade, MARGIN, y);
        y += 5;
    }

    const contatoLinhas: string[] = [];
    if (clinica.telefone) contatoLinhas.push(`Contato: ${clinica.telefone}`);
    if (clinica.endereco) contatoLinhas.push(clinica.endereco);
    const cidadeCep = [clinica.cidade, clinica.cep].filter(Boolean).join(" — ");
    if (cidadeCep) contatoLinhas.push(cidadeCep);
    if (clinica.cnpj) contatoLinhas.push(`CNPJ: ${clinica.cnpj}`);

    set(8, false, ROSA);
    contatoLinhas.forEach((linha, i) => {
        doc.text(linha, PAGE_W - MARGIN, MARGIN + i * 5.5, { align: "right" });
    });

    y = Math.max(y, MARGIN + contatoLinhas.length * 5.5) + 4;

    doc.setDrawColor(...ROSA);
    doc.setLineWidth(0.4);
    doc.line(MARGIN, y, PAGE_W - MARGIN, y);
    y += 12;

    set(12, false, CINZA_ESCURO);
    doc.text(`Sra./Sr. ${pacienteNome}`, MARGIN, y);
    y += 7;

    set(9, false, CINZA);
    const cidadeData = [clinica.cidade, dataConsulta].filter(Boolean).join(", ");
    doc.text(cidadeData, MARGIN, y);
    y += 14;

    medicamentos.forEach((med) => {
        if (y > 220) { doc.addPage(); y = MARGIN; }

        if (med.viaAdministracao) {
            set(10, false, CINZA_ESCURO);
            doc.text(`Uso Interno - ${med.viaAdministracao}`, MARGIN, y);
            y += 8;
        }

        const nomeMed = `${med.medicamento}${med.dosagem ? " " + med.dosagem : ""}`;
        set(11, false, CINZA_ESCURO);

        const duracaoTexto = med.duracao ?? "";
        const nomeW = doc.getTextWidth(nomeMed);
        const duracaoW = duracaoTexto ? doc.getTextWidth(duracaoTexto) : 0;
        const pontosW = CONTENT_W - nomeW - duracaoW - 2;
        const pontoPx = doc.getTextWidth(".");
        const numPontos = Math.max(0, Math.floor(pontosW / pontoPx));
        const pontos = ".".repeat(numPontos);

        doc.text(nomeMed, MARGIN, y);
        if (pontos) {
            set(11, false, CINZA);
            doc.text(pontos, MARGIN + nomeW + 1, y);
        }
        if (duracaoTexto) {
            set(11, false, CINZA_ESCURO);
            doc.text(duracaoTexto, PAGE_W - MARGIN, y, { align: "right" });
        }
        y += 8;

        const partes: string[] = [];
        if (med.frequencia) partes.push(med.frequencia);
        if (med.duracao) partes.push(`por ${med.duracao}`);
        if (med.viaAdministracao) partes.push(`via ${med.viaAdministracao.toLowerCase()}`);

        if (partes.length > 0) {
            set(10, false, CINZA_ESCURO);
            const posologia = partes.join(", ");
            const linhas = doc.splitTextToSize(posologia, CONTENT_W);
            doc.text(linhas, MARGIN, y);
            y += linhas.length * 5.5;
        }

        if (med.observacoes) {
            y += 2;
            set(9, false, CINZA, true);
            const obsLinhas = doc.splitTextToSize(`Obs: ${med.observacoes}`, CONTENT_W);
            doc.text(obsLinhas, MARGIN, y);
            y += obsLinhas.length * 5;
        }

        y += 10;
    });

    const ASSIN_Y = Math.max(y + 10, PAGE_H - 70);
    const linhaW = 60;
    const linhaX = PAGE_W / 2 - linhaW / 2;
    doc.setDrawColor(...CINZA_ESCURO);
    doc.setLineWidth(0.4);
    doc.line(linhaX, ASSIN_Y, linhaX + linhaW, ASSIN_Y);

    set(9, false, CINZA_ESCURO);
    doc.text(`Dr. ${medicoNome}`, PAGE_W / 2, ASSIN_Y + 5.5, { align: "center" });
    if (medicoCrm) {
        set(8.5, false, CINZA);
        doc.text(`CRM: ${medicoCrm}`, PAGE_W / 2, ASSIN_Y + 11, { align: "center" });
    }

    set(8, false, ROSA);
    const rodapeLinhas: string[] = [];
    if (clinica.telefone) rodapeLinhas.push(`Contato: ${clinica.telefone}`);
    if (clinica.endereco) rodapeLinhas.push(clinica.endereco);
    if (cidadeCep) rodapeLinhas.push(cidadeCep);

    rodapeLinhas.forEach((linha, i) => {
        doc.text(linha, PAGE_W - MARGIN, ASSIN_Y + 5 + i * 5.5, { align: "right" });
    });

    const nomeArquivo = `receita_${pacienteNome.replace(/\s+/g, "_").toLowerCase()}_${dataConsulta.replace(/\//g, "-")}.pdf`;
    doc.save(nomeArquivo);
}
