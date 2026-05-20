import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Full points data extracted from the CSV spreadsheets
// Each entry: { name, cycle, total, months: { fev, mar, abr, mai }, extras: { gerencia, patrocinio, linkedin, instagram, eventos_ext, ... } }
const POINTS_DATA = [
  // === 1° CICLO ===
  { name: "Aline Rocha Lobo Lima", cycle: "1_ciclo", total: 25, fev: 0, mar: 1, abr: 4, mai: 0, gerencia: 0, patrocinio: 0, linkedin: 0, instagram: 0, eventos_ext: 3 },
  { name: "Ana Flávia Martins Dias", cycle: "1_ciclo", total: 25, fev: 2, mar: 3, abr: 2, mai: 1, gerencia: 0, patrocinio: 0, linkedin: 0, instagram: 0, eventos_ext: 3 },
  { name: "Ana Luisa de Oliveira Fortunato", cycle: "1_ciclo", total: 26, fev: 2, mar: 3, abr: 4, mai: 0, gerencia: 0, patrocinio: 0, linkedin: 0, instagram: 0, eventos_ext: 3 },
  { name: "Andre Soares Sampaio Laranjeira", cycle: "1_ciclo", total: 6, fev: 0, mar: 2, abr: 1, mai: 0, gerencia: 0, patrocinio: 0, linkedin: 0, instagram: 0, eventos_ext: 3 },
  { name: "Anna Julia Magalhães Belotti", cycle: "1_ciclo", total: 30, fev: 2, mar: 5, abr: 2, mai: 1, gerencia: 0, patrocinio: 0, linkedin: 0, instagram: 0, eventos_ext: 3 },
  { name: "Arthur Moreira de Souza Coelho", cycle: "1_ciclo", total: 19, fev: 2, mar: 4, abr: 2, mai: 2, gerencia: 0, patrocinio: 0, linkedin: 0, instagram: 0, eventos_ext: 3 },
  { name: "Arthur Vaz de Mello Vieira", cycle: "1_ciclo", total: 5, fev: 1, mar: 4, abr: 0, mai: 0, gerencia: 0, patrocinio: 0, linkedin: 0, instagram: 0, eventos_ext: 0 },
  { name: "Augusto Nicácio Vilela", cycle: "1_ciclo", total: 4, fev: 1, mar: 0, abr: 0, mai: 0, gerencia: 0, patrocinio: 0, linkedin: 0, instagram: 0, eventos_ext: 3 },
  { name: "Bernardo Bueno Ribeiro", cycle: "1_ciclo", total: 68, fev: 2, mar: 3, abr: 2, mai: 4, gerencia: 0, patrocinio: 0, linkedin: 4, instagram: 0, eventos_ext: 6, indicacao: 10 },
  { name: "Bernardo Fernandes Brasil", cycle: "1_ciclo", total: 10, fev: 1, mar: 4, abr: 2, mai: 1, gerencia: 0, patrocinio: 0, linkedin: 0, instagram: 0, eventos_ext: 0 },
  { name: "Bernardo Gatti Alves Amaral", cycle: "1_ciclo", total: 58, fev: 2, mar: 5, abr: 4, mai: 4, gerencia: 0, patrocinio: 0, linkedin: 0, instagram: 0, eventos_ext: 9 },
  { name: "Bruno Piazza Teixeira", cycle: "1_ciclo", total: 8, fev: 2, mar: 5, abr: 1, mai: 0, gerencia: 0, patrocinio: 0, linkedin: 0, instagram: 0, eventos_ext: 0 },
  { name: "Caique Magalhães", cycle: "1_ciclo", total: 36, fev: 2, mar: 5, abr: 2, mai: 3, gerencia: 0, patrocinio: 0, linkedin: 0, instagram: 0, eventos_ext: 3 },
  { name: "Cauã Cardoso", cycle: "1_ciclo", total: 12, fev: 0, mar: 2, abr: 0, mai: 0, gerencia: 0, patrocinio: 0, linkedin: 0, instagram: 0, eventos_ext: 3 },
  { name: "Clara Borges Pimentel Nunes", cycle: "1_ciclo", total: 60, fev: 2, mar: 4, abr: 3, mai: 4, gerencia: 0, patrocinio: 0, linkedin: 4, instagram: 0, eventos_ext: 3 },
  { name: "Daniel Mota de Castro", cycle: "1_ciclo", total: 23, fev: 1, mar: 2, abr: 4, mai: 0, gerencia: 0, patrocinio: 0, linkedin: 0, instagram: 0, eventos_ext: 0 },
  { name: "Daniela Santos Nacur", cycle: "1_ciclo", total: 45, fev: 2, mar: 4, abr: 3, mai: 3, gerencia: 0, patrocinio: 0, linkedin: 0, instagram: 0, eventos_ext: 0 },
  { name: "Davi Junio Moura Pereira", cycle: "1_ciclo", total: 55, fev: 2, mar: 5, abr: 4, mai: 4, gerencia: 0, patrocinio: 0, linkedin: 0, instagram: 0, eventos_ext: 3 },
  { name: "Davi Magalhães Maia e Souza", cycle: "1_ciclo", total: 11, fev: 0, mar: 3, abr: 2, mai: 2, gerencia: 0, patrocinio: 0, linkedin: 0, instagram: 0, eventos_ext: 3 },
  { name: "Eduardo bicalho ferraz", cycle: "1_ciclo", total: 4, fev: 1, mar: 3, abr: 0, mai: 0, gerencia: 0, patrocinio: 0, linkedin: 0, instagram: 0, eventos_ext: 0 },
  { name: "Eduardo Henrique Rodrigues Silva", cycle: "1_ciclo", total: 33, fev: 2, mar: 1, abr: 4, mai: 3, gerencia: 0, patrocinio: 0, linkedin: 0, instagram: 0, eventos_ext: 3 },
  { name: "Elmo Miranda Patrus", cycle: "1_ciclo", total: 24, fev: 0, mar: 4, abr: 3, mai: 4, gerencia: 0, patrocinio: 0, linkedin: 0, instagram: 0, eventos_ext: 0 },
  { name: "Emanuel Rodrigues Brandão", cycle: "1_ciclo", total: 46, fev: 2, mar: 5, abr: 3, mai: 4, gerencia: 0, patrocinio: 0, linkedin: 0, instagram: 0, eventos_ext: 0 },
  { name: "Felipe Cardoso Oliveira Costa", cycle: "1_ciclo", total: 38, fev: 1, mar: 5, abr: 4, mai: 2, gerencia: 0, patrocinio: 0, linkedin: 0, instagram: 0, eventos_ext: 0 },
  { name: "Gabriel Recoder tolentino", cycle: "1_ciclo", total: 5, fev: 1, mar: 4, abr: 0, mai: 0, gerencia: 0, patrocinio: 0, linkedin: 0, instagram: 0, eventos_ext: 0 },
  { name: "Gabriela Ferreira Guimarães", cycle: "1_ciclo", total: 32, fev: 2, mar: 3, abr: 1, mai: 3, gerencia: 0, patrocinio: 0, linkedin: 2, instagram: 0, eventos_ext: 0 },
  { name: "Gabriella Micelli Pimenta Vaz", cycle: "1_ciclo", total: 59, fev: 2, mar: 4, abr: 3, mai: 4, gerencia: 0, patrocinio: 0, linkedin: 2, instagram: 0, eventos_ext: 3 },
  { name: "Georgia Sousa Lima Machado", cycle: "1_ciclo", total: 4, fev: 1, mar: 3, abr: 0, mai: 0, gerencia: 0, patrocinio: 0, linkedin: 0, instagram: 0, eventos_ext: 0 },
  { name: "Guilherme Clementino Pisani Martini", cycle: "1_ciclo", total: 70, fev: 2, mar: 5, abr: 4, mai: 4, gerencia: 0, patrocinio: 0, linkedin: 10, instagram: 0, eventos_ext: 9 },
  { name: "Gustavo Henrique Ferreira Guimarães", cycle: "1_ciclo", total: 27, fev: 2, mar: 4, abr: 3, mai: 3, gerencia: 0, patrocinio: 0, linkedin: 0, instagram: 0, eventos_ext: 0 },
  { name: "Gustavo Mansur Mapa", cycle: "1_ciclo", total: 47, fev: 1, mar: 5, abr: 4, mai: 4, gerencia: 0, patrocinio: 0, linkedin: 2, instagram: 0, eventos_ext: 0 },
  { name: "Gustavo Teodoro Passos Campos", cycle: "1_ciclo", total: 34, fev: 1, mar: 4, abr: 3, mai: 4, gerencia: 0, patrocinio: 0, linkedin: 0, instagram: 0, eventos_ext: 3 },
  { name: "Humberto Felix da Silva Filho", cycle: "1_ciclo", total: 45, fev: 2, mar: 5, abr: 3, mai: 3, gerencia: 0, patrocinio: 0, linkedin: 2, instagram: 0, eventos_ext: 0 },
  { name: "Isabela Alves Cordeiro", cycle: "1_ciclo", total: 42, fev: 2, mar: 4, abr: 2, mai: 3, gerencia: 0, patrocinio: 0, linkedin: 0, instagram: 0, eventos_ext: 0 },
  { name: "João Pedro Amorim Amato", cycle: "1_ciclo", total: 29, fev: 2, mar: 5, abr: 0, mai: 4, gerencia: 0, patrocinio: 0, linkedin: 4, instagram: 0, eventos_ext: 0 },
  { name: "João Vitor Rodrigues Ladeira", cycle: "1_ciclo", total: 3, fev: 2, mar: 1, abr: 0, mai: 0, gerencia: 0, patrocinio: 0, linkedin: 0, instagram: 0, eventos_ext: 0 },
  { name: "Julia Melo Araújo", cycle: "1_ciclo", total: 27, fev: 2, mar: 4, abr: 1, mai: 4, gerencia: 0, patrocinio: 0, linkedin: 0, instagram: 0, eventos_ext: 0 },
  { name: "Leon David Cruz de Braga", cycle: "1_ciclo", total: 41, fev: 1, mar: 3, abr: 4, mai: 2, gerencia: 0, patrocinio: 0, linkedin: 2, instagram: 0, eventos_ext: 0 },
  { name: "Letícia Amaral Oliveira", cycle: "1_ciclo", total: 33, fev: 1, mar: 3, abr: 2, mai: 1, gerencia: 0, patrocinio: 0, linkedin: 4, instagram: 0, eventos_ext: 0 },
  { name: "Letícia Costa Moreira", cycle: "1_ciclo", total: 25, fev: 2, mar: 4, abr: 2, mai: 2, gerencia: 0, patrocinio: 0, linkedin: 0, instagram: 0, eventos_ext: 0 },
  { name: "Luca Costa Battella Gotlib", cycle: "1_ciclo", total: 27, fev: 2, mar: 4, abr: 2, mai: 1, gerencia: 0, patrocinio: 0, linkedin: 0, instagram: 0, eventos_ext: 3 },
  { name: "Lucas Cadar", cycle: "1_ciclo", total: 2, fev: 1, mar: 1, abr: 0, mai: 0, gerencia: 0, patrocinio: 0, linkedin: 0, instagram: 0, eventos_ext: 0 },
  { name: "Lucas Ferreira Pedras", cycle: "1_ciclo", total: 27, fev: 2, mar: 2, abr: 4, mai: 4, gerencia: 0, patrocinio: 0, linkedin: 0, instagram: 0, eventos_ext: 3 },
  { name: "Lucas Geanveda", cycle: "1_ciclo", total: 25, fev: 2, mar: 5, abr: 1, mai: 0, gerencia: 0, patrocinio: 0, linkedin: 4, instagram: 0, eventos_ext: 3 },
  { name: "Manoela Araujo Lann", cycle: "1_ciclo", total: 23, fev: 2, mar: 3, abr: 1, mai: 0, gerencia: 0, patrocinio: 0, linkedin: 0, instagram: 0, eventos_ext: 0 },
  { name: "Maria Clara Monteiro Barbosa", cycle: "1_ciclo", total: 35, fev: 2, mar: 5, abr: 3, mai: 3, gerencia: 0, patrocinio: 0, linkedin: 0, instagram: 0, eventos_ext: 3 },
  { name: "Maria Eduarda Ribeiro Rodrigues Oliveira", cycle: "1_ciclo", total: 57, fev: 2, mar: 3, abr: 3, mai: 3, gerencia: 0, patrocinio: 0, linkedin: 6, instagram: 0, eventos_ext: 6 },
  { name: "Maria Julia Araujo Maia", cycle: "1_ciclo", total: 23, fev: 2, mar: 3, abr: 2, mai: 1, gerencia: 0, patrocinio: 0, linkedin: 0, instagram: 0, eventos_ext: 0 },
  { name: "Mariana Ferreira Redoan", cycle: "1_ciclo", total: 20, fev: 1, mar: 2, abr: 3, mai: 3, gerencia: 0, patrocinio: 0, linkedin: 0, instagram: 0, eventos_ext: 0 },
  { name: "Mateus Novais Ferreira Baginski", cycle: "1_ciclo", total: 34, fev: 2, mar: 5, abr: 4, mai: 4, gerencia: 0, patrocinio: 0, linkedin: 0, instagram: 0, eventos_ext: 0 },
  { name: "Matheus Rodrigues Fontes Moreira", cycle: "1_ciclo", total: 58, fev: 2, mar: 3, abr: 3, mai: 4, gerencia: 0, patrocinio: 0, linkedin: 0, instagram: 0, eventos_ext: 3 },
  { name: "Nina Rafaella Baldan Ennes", cycle: "1_ciclo", total: 15, fev: 2, mar: 2, abr: 1, mai: 0, gerencia: 0, patrocinio: 0, linkedin: 0, instagram: 0, eventos_ext: 3 },
  { name: "Pedro Lopes Sampaio Cacique Salles", cycle: "1_ciclo", total: 38, fev: 2, mar: 5, abr: 4, mai: 4, gerencia: 0, patrocinio: 0, linkedin: 0, instagram: 0, eventos_ext: 0 },
  { name: "Pedro Moreira Lobo", cycle: "1_ciclo", total: 1, fev: 0, mar: 1, abr: 0, mai: 0, gerencia: 0, patrocinio: 0, linkedin: 0, instagram: 0, eventos_ext: 0 },
  { name: "Rafael de Faria Barbosa", cycle: "1_ciclo", total: 24, fev: 2, mar: 4, abr: 3, mai: 1, gerencia: 0, patrocinio: 0, linkedin: 0, instagram: 0, eventos_ext: 0 },
  { name: "Rafael Leandro Dias da Silva", cycle: "1_ciclo", total: 4, fev: 2, mar: 2, abr: 0, mai: 0, gerencia: 0, patrocinio: 0, linkedin: 0, instagram: 0, eventos_ext: 0 },
  { name: "Raquel Gouthier de Carvalho", cycle: "1_ciclo", total: 10, fev: 2, mar: 2, abr: 0, mai: 0, gerencia: 0, patrocinio: 0, linkedin: 0, instagram: 0, eventos_ext: 0 },
  { name: "Rúbia Maciel e Lacerda", cycle: "1_ciclo", total: 29, fev: 2, mar: 4, abr: 1, mai: 3, gerencia: 0, patrocinio: 0, linkedin: 0, instagram: 0, eventos_ext: 0 },
  { name: "Samuel Ribeiro de Castro", cycle: "1_ciclo", total: 4, fev: 2, mar: 0, abr: 0, mai: 1, gerencia: 0, patrocinio: 0, linkedin: 0, instagram: 0, eventos_ext: 0 },
  { name: "Sofia Camargos Oliveira", cycle: "1_ciclo", total: 12, fev: 1, mar: 3, abr: 1, mai: 1, gerencia: 0, patrocinio: 0, linkedin: 0, instagram: 0, eventos_ext: 3 },
  { name: "Thales Souza Affonso", cycle: "1_ciclo", total: 31, fev: 2, mar: 5, abr: 4, mai: 4, gerencia: 0, patrocinio: 0, linkedin: 0, instagram: 0, eventos_ext: 0 },
  { name: "Theo do Couto e Silva Bubani", cycle: "1_ciclo", total: 51, fev: 2, mar: 5, abr: 4, mai: 3, gerencia: 0, patrocinio: 0, linkedin: 0, instagram: 0, eventos_ext: 6 },
  { name: "Théo Pires Balbino", cycle: "1_ciclo", total: 26, fev: 2, mar: 3, abr: 4, mai: 4, gerencia: 0, patrocinio: 0, linkedin: 0, instagram: 0, eventos_ext: 3 },
  { name: "Valentina Ignacchiti Gonçalves Teixeira", cycle: "1_ciclo", total: 50, fev: 2, mar: 5, abr: 4, mai: 3, gerencia: 0, patrocinio: 0, linkedin: 0, instagram: 0, eventos_ext: 3 },
  { name: "Victor Bocelli Xavier Baladon", cycle: "1_ciclo", total: 46, fev: 2, mar: 4, abr: 3, mai: 4, gerencia: 0, patrocinio: 0, linkedin: 0, instagram: 0, eventos_ext: 3 },
  { name: "Vitor Antônio Drumond Silvestre", cycle: "1_ciclo", total: 44, fev: 2, mar: 4, abr: 3, mai: 3, gerencia: 0, patrocinio: 0, linkedin: 0, instagram: 0, eventos_ext: 0 },
  { name: "Vitor Hugo Lopes Ferreira de Oliveira", cycle: "1_ciclo", total: 26, fev: 2, mar: 5, abr: 0, mai: 4, gerencia: 0, patrocinio: 0, linkedin: 4, instagram: 0, eventos_ext: 0 },
  { name: "Vitória Nogueira Leite Antunes", cycle: "1_ciclo", total: 29, fev: 2, mar: 3, abr: 4, mai: 2, gerencia: 0, patrocinio: 0, linkedin: 0, instagram: 0, eventos_ext: 3 },
  { name: "Yasmim Alves", cycle: "1_ciclo", total: 47, fev: 2, mar: 5, abr: 3, mai: 3, gerencia: 15, patrocinio: 0, linkedin: 0, instagram: 0, eventos_ext: 0 },

  // === 2° CICLO ===
  { name: "Ana Clara Braga Ferreira e Sousa Nunes", cycle: "2_ciclo", total: 37, fev: 1, mar: 4, abr: 3, mai: 4, gerencia: 0, patrocinio: 0, linkedin: 0, instagram: 0, eventos_ext: 0 },
  { name: "Artur Lázaro Reis Altivo", cycle: "2_ciclo", total: 23, fev: 2, mar: 4, abr: 2, mai: 3, gerencia: 0, patrocinio: 0, linkedin: 0, instagram: 0, eventos_ext: 3 },
  { name: "Bruno Chieppe Mattos", cycle: "2_ciclo", total: 32, fev: 1, mar: 3, abr: 4, mai: 3, gerencia: 0, patrocinio: 0, linkedin: 0, instagram: 0, eventos_ext: 3 },
  { name: "Felipe Magno Costa Fróis", cycle: "2_ciclo", total: 4, fev: 2, mar: 2, abr: 0, mai: 0, gerencia: 0, patrocinio: 0, linkedin: 0, instagram: 0, eventos_ext: 0 },
  { name: "Fernanda Mascarenhas Pedrosa", cycle: "2_ciclo", total: 57, fev: 1, mar: 4, abr: 4, mai: 4, gerencia: 0, patrocinio: 0, linkedin: 0, instagram: 0, eventos_ext: 6 },
  { name: "Gustavo Bastos Carneiro", cycle: "2_ciclo", total: 43, fev: 2, mar: 5, abr: 3, mai: 4, gerencia: 0, patrocinio: 0, linkedin: 0, instagram: 0, eventos_ext: 3 },
  { name: "Helena Dias de Castro", cycle: "2_ciclo", total: 25, fev: 2, mar: 4, abr: 1, mai: 3, gerencia: 0, patrocinio: 0, linkedin: 0, instagram: 0, eventos_ext: 3 },
  { name: "Henrique Fabri Labriola", cycle: "2_ciclo", total: 17, fev: 2, mar: 3, abr: 1, mai: 2, gerencia: 0, patrocinio: 0, linkedin: 0, instagram: 0, eventos_ext: 0 },
  { name: "João Pedro Moreira dos Santos", cycle: "2_ciclo", total: 23, fev: 2, mar: 3, abr: 2, mai: 3, gerencia: 0, patrocinio: 0, linkedin: 0, instagram: 0, eventos_ext: 0 },
  { name: "Júlia Zilda Pessoa Leal Mol", cycle: "2_ciclo", total: 56, fev: 0, mar: 4, abr: 4, mai: 4, gerencia: 0, patrocinio: 0, linkedin: 4, instagram: 0, eventos_ext: 6 },
  { name: "Lara Pace Costa", cycle: "2_ciclo", total: 39, fev: 2, mar: 4, abr: 3, mai: 2, gerencia: 0, patrocinio: 0, linkedin: 2, instagram: 0, eventos_ext: 6 },
  { name: "Miguel Saran Campos", cycle: "2_ciclo", total: 1, fev: 0, mar: 1, abr: 0, mai: 0, gerencia: 0, patrocinio: 0, linkedin: 0, instagram: 0, eventos_ext: 0 },
  { name: "Roberto Bracarense Picinin", cycle: "2_ciclo", total: 12, fev: 1, mar: 5, abr: 1, mai: 1, gerencia: 0, patrocinio: 0, linkedin: 0, instagram: 0, eventos_ext: 0 },
  { name: "Thallia Thayssa Lobo", cycle: "2_ciclo", total: 37, fev: 2, mar: 5, abr: 4, mai: 1, gerencia: 0, patrocinio: 0, linkedin: 0, instagram: 0, eventos_ext: 0 },
  { name: "Vinicius Martins", cycle: "2_ciclo", total: 52, fev: 2, mar: 4, abr: 4, mai: 4, gerencia: 0, patrocinio: 0, linkedin: 0, instagram: 0, eventos_ext: 3 },
  { name: "Davi Vernaschi", cycle: "2_ciclo", total: 7, fev: 1, mar: 3, abr: 2, mai: 1, gerencia: 0, patrocinio: 0, linkedin: 0, instagram: 0, eventos_ext: 0 },

  // === 3° CICLO ===
  { name: "Ana Carolina Salmen Eller Miranda", cycle: "3_ciclo", total: 39, fev: 2, mar: 5, abr: 4, mai: 3, gerencia: 0, patrocinio: 0, linkedin: 0, instagram: 0, eventos_ext: 0 },
  { name: "Antônia Almeida Andrade", cycle: "3_ciclo", total: 36, fev: 2, mar: 4, abr: 4, mai: 2, gerencia: 0, patrocinio: 0, linkedin: 0, instagram: 0, eventos_ext: 3 },
  { name: "Bernardo Reis Barbosa", cycle: "3_ciclo", total: 57, fev: 2, mar: 5, abr: 4, mai: 4, gerencia: 0, patrocinio: 0, linkedin: 0, instagram: 0, eventos_ext: 6 },
  { name: "Blaen Almeida de Oliveira Mota", cycle: "3_ciclo", total: 27, fev: 2, mar: 2, abr: 2, mai: 3, gerencia: 0, patrocinio: 0, linkedin: 2, instagram: 0, eventos_ext: 0 },
  { name: "Bruna Elen de Melo", cycle: "3_ciclo", total: 41, fev: 0, mar: 4, abr: 3, mai: 4, gerencia: 0, patrocinio: 0, linkedin: 0, instagram: 0, eventos_ext: 0 },
  { name: "Kenia Alexsandra Rodrigues Ferreira", cycle: "3_ciclo", total: 38, fev: 2, mar: 5, abr: 4, mai: 4, gerencia: 0, patrocinio: 0, linkedin: 0, instagram: 0, eventos_ext: 3 },
  { name: "Laura Luiza Antunes Pimenta", cycle: "3_ciclo", total: 4, fev: 2, mar: 2, abr: 0, mai: 0, gerencia: 0, patrocinio: 0, linkedin: 0, instagram: 0, eventos_ext: 0 },
  { name: "Laura Schafer de Castro", cycle: "3_ciclo", total: 41, fev: 2, mar: 5, abr: 3, mai: 2, gerencia: 0, patrocinio: 0, linkedin: 0, instagram: 0, eventos_ext: 0 },
  { name: "Lucas Fonseca Menezes", cycle: "3_ciclo", total: 36, fev: 2, mar: 5, abr: 2, mai: 4, gerencia: 0, patrocinio: 0, linkedin: 0, instagram: 0, eventos_ext: 3 },
  { name: "Luiza Resende Araujo Lima", cycle: "3_ciclo", total: 32, fev: 2, mar: 4, abr: 3, mai: 3, gerencia: 0, patrocinio: 0, linkedin: 0, instagram: 0, eventos_ext: 3 },
  { name: "Marco Túlio Gontijo de Sousa", cycle: "3_ciclo", total: 44, fev: 2, mar: 4, abr: 4, mai: 4, gerencia: 0, patrocinio: 0, linkedin: 0, instagram: 0, eventos_ext: 3 },
  { name: "Maria Clara Dutra Moreira e Silva", cycle: "3_ciclo", total: 33, fev: 1, mar: 4, abr: 3, mai: 3, gerencia: 0, patrocinio: 0, linkedin: 0, instagram: 0, eventos_ext: 0 },
  { name: "Maria Luiza Quintela Orsini", cycle: "3_ciclo", total: 61, fev: 2, mar: 5, abr: 4, mai: 4, gerencia: 0, patrocinio: 0, linkedin: 2, instagram: 4, eventos_ext: 3 },
  { name: "Matteo Cambraia Soares", cycle: "3_ciclo", total: 58, fev: 1, mar: 5, abr: 4, mai: 3, gerencia: 0, patrocinio: 0, linkedin: 4, instagram: 0, eventos_ext: 6 },
  { name: "Mel Meister", cycle: "3_ciclo", total: 44, fev: 2, mar: 2, abr: 4, mai: 3, gerencia: 0, patrocinio: 0, linkedin: 0, instagram: 0, eventos_ext: 9 },
  { name: "Rodrigo Warley de Freitas Barbosa", cycle: "3_ciclo", total: 38, fev: 2, mar: 4, abr: 1, mai: 4, gerencia: 0, patrocinio: 0, linkedin: 2, instagram: 0, eventos_ext: 3 },
  { name: "Victoria Amanda dos Reis Dias", cycle: "3_ciclo", total: 28, fev: 2, mar: 3, abr: 2, mai: 2, gerencia: 0, patrocinio: 0, linkedin: 2, instagram: 0, eventos_ext: 3 },
  { name: "Vinicius Costa Moreira", cycle: "3_ciclo", total: 7, fev: 1, mar: 3, abr: 0, mai: 0, gerencia: 0, patrocinio: 0, linkedin: 0, instagram: 0, eventos_ext: 3 },
];

function normalizeName(name) {
  if (!name) return "";
  return name.toLowerCase().trim()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ");
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== "admin") {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    const reqBody = await req.json().catch(() => ({}));
    const step = reqBody.step || "import"; // "clear" | "import"

    // Fetch all members
    const members = await base44.asServiceRole.entities.Member.list();
    const memberByName = {};
    members.forEach(m => {
      memberByName[normalizeName(m.full_name)] = m;
    });

    // STEP: clear — just delete existing entries and return
    if (step === "clear") {
      const existing = await base44.asServiceRole.entities.PointsLedger.filter(
        { source_type: "planilha_2026" }, undefined, 2000
      );
      for (let i = 0; i < existing.length; i += 5) {
        await Promise.all(existing.slice(i, i + 5).map(e =>
          base44.asServiceRole.entities.PointsLedger.delete(e.id)
        ));
        await new Promise(r => setTimeout(r, 200));
      }
      return Response.json({ success: true, cleared: existing.length });
    }

    const results = [];
    const membersUpdated = new Set();
    const allEntries = [];

    for (const row of POINTS_DATA) {
      const normRowName = normalizeName(row.name);

      // Find member by exact or partial name match
      let member = memberByName[normRowName];
      if (!member) {
        // Try partial match
        const rowWords = normRowName.split(" ").filter(w => w.length > 2);
        for (const [mName, m] of Object.entries(memberByName)) {
          if (rowWords.length >= 2 && rowWords.every(w => mName.includes(w))) {
            member = m;
            break;
          }
        }
      }

      if (!member) {
        results.push({ name: row.name, status: "não encontrado" });
        continue;
      }

      const entriesToCreate = [];

      // Monthly presence points
      const months = [
        { key: "fev", label: "Fevereiro/2026", date: "2026-02-28" },
        { key: "mar", label: "Março/2026", date: "2026-03-31" },
        { key: "abr", label: "Abril/2026", date: "2026-04-30" },
        { key: "mai", label: "Maio/2026", date: "2026-05-31" },
      ];

      for (const m of months) {
        const pts = row[m.key] || 0;
        if (pts > 0) {
          entriesToCreate.push({
            member_id: member.id,
            member_name: member.full_name,
            points: pts,
            category: "evento_ordinario",
            action: `Presença e atividades — ${m.label}`,
            source_type: "planilha_2026",
            source_id: `planilha_${m.key}_2026`,
            source_name: `Ranking Formação ${m.label}`,
            status: "aprovado",
            notes: `Importado da planilha de ranking — ${m.label}`,
          });
        }
      }

      // Extra categories
      if ((row.gerencia || 0) > 0) {
        entriesToCreate.push({
          member_id: member.id, member_name: member.full_name,
          points: row.gerencia, category: "gerencia",
          action: "Gerência 2026", source_type: "planilha_2026",
          source_id: "planilha_gerencia_2026", source_name: "Gerência",
          status: "aprovado", notes: "Importado da planilha de ranking",
        });
      }
      if ((row.patrocinio || 0) > 0) {
        entriesToCreate.push({
          member_id: member.id, member_name: member.full_name,
          points: row.patrocinio, category: "patrocinio",
          action: "Patrocínio 2026", source_type: "planilha_2026",
          source_id: "planilha_patrocinio_2026", source_name: "Patrocínio",
          status: "aprovado", notes: "Importado da planilha de ranking",
        });
      }
      if ((row.linkedin || 0) > 0) {
        entriesToCreate.push({
          member_id: member.id, member_name: member.full_name,
          points: row.linkedin, category: "linkedin",
          action: "Posts LinkedIn 2026", source_type: "planilha_2026",
          source_id: "planilha_linkedin_2026", source_name: "LinkedIn",
          status: "aprovado", notes: "Importado da planilha de ranking",
        });
      }
      if ((row.instagram || 0) > 0) {
        entriesToCreate.push({
          member_id: member.id, member_name: member.full_name,
          points: row.instagram, category: "instagram",
          action: "Posts Instagram 2026", source_type: "planilha_2026",
          source_id: "planilha_instagram_2026", source_name: "Instagram",
          status: "aprovado", notes: "Importado da planilha de ranking",
        });
      }
      if ((row.eventos_ext || 0) > 0) {
        entriesToCreate.push({
          member_id: member.id, member_name: member.full_name,
          points: row.eventos_ext, category: "evento_extraordinario",
          action: "Eventos Extraordinários 2026", source_type: "planilha_2026",
          source_id: "planilha_eventos_ext_2026", source_name: "Eventos Extraordinários",
          status: "aprovado", notes: "Importado da planilha de ranking",
        });
      }
      if ((row.indicacao || 0) > 0) {
        entriesToCreate.push({
          member_id: member.id, member_name: member.full_name,
          points: row.indicacao, category: "institucional",
          action: "Indicação de Palestrante 2026", source_type: "planilha_2026",
          source_id: "planilha_indicacao_2026", source_name: "Indicação de Palestrante",
          status: "aprovado", notes: "Importado da planilha de ranking",
        });
      }

      if (entriesToCreate.length > 0) {
        allEntries.push(...entriesToCreate);
      }

      membersUpdated.add(member.id);
      results.push({ name: row.name, member: member.full_name, entries: entriesToCreate.length, total: row.total, status: "importado" });
    }

    // Bulk create all ledger entries in batches of 10 with delay
    const BATCH_SIZE = 10;
    for (let i = 0; i < allEntries.length; i += BATCH_SIZE) {
      const batch = allEntries.slice(i, i + BATCH_SIZE);
      await base44.asServiceRole.entities.PointsLedger.bulkCreate(batch);
      if (i + BATCH_SIZE < allEntries.length) {
        await new Promise(r => setTimeout(r, 300));
      }
    }

    // Recalculate total_points for all updated members
    // Build totals from allEntries (already have the data, no extra queries needed)
    const totalsByMember = {};
    for (const entry of allEntries) {
      totalsByMember[entry.member_id] = (totalsByMember[entry.member_id] || 0) + entry.points;
    }
    const memberUpdatePromises = Object.entries(totalsByMember).map(([memberId, pts]) =>
      base44.asServiceRole.entities.Member.update(memberId, { total_points: pts })
    );
    await Promise.all(memberUpdatePromises);

    return Response.json({
      success: true,
      imported: results.filter(r => r.status === "importado").length,
      not_found: results.filter(r => r.status === "não encontrado").length,
      members_updated: membersUpdated.size,
      results,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});