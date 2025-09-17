// Mock data for the tournament platform

export const mockUser = {
  id: 1,
  username: "ProGamer2024",
  email: "progamer@example.com",
  avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=faces",
  isAuthenticated: false
};

export const mockGames = [
  { id: 1, name: "Valorant", icon: "🎯" },
  { id: 2, name: "Counter-Strike 2", icon: "🔫" },
  { id: 3, name: "League of Legends", icon: "⚔️" },
  { id: 4, name: "Clash Royale", icon: "👑" },
  { id: 5, name: "Brawl Stars", icon: "⭐" },
  { id: 6, name: "Dota 2", icon: "🗡️" },
  { id: 7, name: "Overwatch 2", icon: "🦾" },
  { id: 8, name: "Rocket League", icon: "🚀" }
];

export const mockTournaments = [
  {
    id: 1,
    name: "Valorant Championship 2024",
    game: "Valorant",
    organizer: "ProGamer2024",
    participants: 32,
    maxParticipants: 32,
    status: "active",
    startDate: "2024-08-15",
    endDate: "2024-08-17",
    prize: "$5,000",
    description: "Torneo profesional de Valorant con premios en efectivo. Solo equipos de 5 jugadores.",
    rules: "Formato eliminación directa, mejor de 3 mapas, sin sustituciones durante partidas.",
    judges: ["Judge1", "Judge2"],
    createdAt: "2024-07-20",
    registrationDeadline: "2024-08-10"
  },
  {
    id: 2,
    name: "CS2 Pro League",
    game: "Counter-Strike 2",
    organizer: "ESportsAdmin",
    participants: 16,
    maxParticipants: 24,
    status: "registration",
    startDate: "2024-08-20",
    endDate: "2024-08-22",
    prize: "$3,000",
    description: "Liga profesional de Counter-Strike 2 para equipos experimentados.",
    rules: "Formato liga round-robin seguido de playoffs. Partidas mejor de 3.",
    judges: ["CS2Judge1"],
    createdAt: "2024-07-18",
    registrationDeadline: "2024-08-18"
  },
  {
    id: 3,
    name: "LoL Amateur Cup",
    game: "League of Legends",
    organizer: "CommunityOrg",
    participants: 8,
    maxParticipants: 16,
    status: "registration",
    startDate: "2024-08-25",
    endDate: "2024-08-25",
    prize: "$1,500",
    description: "Copa amateur de League of Legends para jugadores novatos y semi-profesionales.",
    rules: "Formato bracket doble eliminación, partidas mejor de 1 hasta finales.",
    judges: [],
    createdAt: "2024-07-22",
    registrationDeadline: "2024-08-23"
  },
  {
    id: 4,
    name: "Mobile Legends Tournament",
    game: "Clash Royale",
    organizer: "MobileGaming",
    participants: 64,
    maxParticipants: 64,
    status: "completed",
    startDate: "2024-07-10",
    endDate: "2024-07-12",
    prize: "$2,000",
    description: "Torneo masivo de Clash Royale con más de 60 participantes.",
    rules: "Eliminación directa, partidas mejor de 3, deck estándar permitido.",
    judges: ["MobileJudge1", "MobileJudge2"],
    createdAt: "2024-06-15",
    registrationDeadline: "2024-07-08"
  }
];

export const mockStats = {
  totalTournaments: 156,
  activeTournaments: 12,
  totalPlayers: 2847,
  totalPrizePool: "$45,000"
};