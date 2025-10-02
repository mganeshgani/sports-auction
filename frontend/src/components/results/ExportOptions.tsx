import React from 'react';
import { CSVLink } from 'react-csv';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { Player } from '../../types';
import { Team } from '../../types';
import ResultsPDF from './ResultsPDF';

interface ExportOptionsProps {
  teams: Team[];
  players: Player[];
}

const ExportOptions: React.FC<ExportOptionsProps> = ({ teams, players }) => {
  // Prepare CSV data for players
  const playerHeaders = [
    { label: 'Name', key: 'name' },
    { label: 'Position', key: 'position' },
    { label: 'Base Price', key: 'basePrice' },
    { label: 'Sold Price', key: 'soldPrice' },
    { label: 'Team', key: 'teamName' },
    { label: 'Status', key: 'status' }
  ];

  const playerData = players.map(player => ({
    ...player,
    teamName: teams.find(t => t._id === player.team)?.name || 'Unsold'
  }));

  // Prepare CSV data for teams
  const teamHeaders = [
    { label: 'Team Name', key: 'name' },
    { label: 'Total Players', key: 'totalPlayers' },
    { label: 'Initial Budget', key: 'initialBudget' },
    { label: 'Remaining Budget', key: 'budget' },
    { label: 'Spent Amount', key: 'spentAmount' }
  ];

  const teamData = teams.map(team => ({
    ...team,
    totalPlayers: team.players.length,
    initialBudget: (team.budget || 0) + team.players.reduce((sum: number, p: Player) => sum + p.soldAmount, 0),
    spentAmount: team.players.reduce((sum: number, p: Player) => sum + p.soldAmount, 0)
  }));

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white mb-4">Export Results</h2>
      
      {/* CSV Exports */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-white/10 rounded-lg backdrop-blur-lg">
          <h3 className="text-lg font-semibold text-white mb-3">Player Data</h3>
          <CSVLink
            data={playerData}
            headers={playerHeaders}
            filename="auction_players.csv"
            className="inline-block px-4 py-2 bg-purple-600 hover:bg-purple-700
                     text-white rounded-lg transition-colors"
          >
            Download Players CSV
          </CSVLink>
        </div>

        <div className="p-4 bg-white/10 rounded-lg backdrop-blur-lg">
          <h3 className="text-lg font-semibold text-white mb-3">Team Data</h3>
          <CSVLink
            data={teamData}
            headers={teamHeaders}
            filename="auction_teams.csv"
            className="inline-block px-4 py-2 bg-purple-600 hover:bg-purple-700
                     text-white rounded-lg transition-colors"
          >
            Download Teams CSV
          </CSVLink>
        </div>
      </div>

      {/* PDF Export */}
      <div className="p-4 bg-white/10 rounded-lg backdrop-blur-lg">
        <h3 className="text-lg font-semibold text-white mb-3">Complete Report</h3>
        <PDFDownloadLink
          document={<ResultsPDF teams={teams} players={players} />}
          fileName="auction_results.pdf"
          className="inline-block px-4 py-2 bg-purple-600 hover:bg-purple-700
                   text-white rounded-lg transition-colors"
        >
          {({ loading }: { loading: boolean }) => (
            <span>{loading ? 'Generating PDF...' : 'Download Complete PDF'}</span>
          )}
        </PDFDownloadLink>
      </div>

      {/* Export Instructions */}
      <div className="mt-6 p-4 bg-white/5 rounded-lg text-white/70 text-sm">
        <h4 className="font-semibold mb-2">Export Options:</h4>
        <ul className="list-disc list-inside space-y-1">
          <li>CSV files can be opened in Excel or Google Sheets</li>
          <li>PDF report includes complete auction results and statistics</li>
          <li>All exports include final prices and team assignments</li>
        </ul>
      </div>
    </div>
  );
};

export default ExportOptions;