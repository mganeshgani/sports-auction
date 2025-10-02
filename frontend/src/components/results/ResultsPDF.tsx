import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font
} from '@react-pdf/renderer';
import { Player, Team } from '../../types';

export interface ResultsPDFProps {
  players: Player[];
  teams: Team[];
}

// Register custom font
Font.register({
  family: 'Inter',
  src: 'https://rsms.me/inter/font-files/Inter-Regular.woff2'
});

// Create styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 30
  },
  section: {
    marginBottom: 20
  },
  header: {
    fontSize: 24,
    marginBottom: 20,
    fontFamily: 'Inter',
    color: '#1a1a1a'
  },
  subHeader: {
    fontSize: 18,
    marginBottom: 10,
    fontFamily: 'Inter',
    color: '#4a5568'
  },
  table: {
    // Remove display property as it's not needed for PDF generation
    width: '100%',
    marginBottom: 10
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    minHeight: 30,
    alignItems: 'center'
  },
  tableHeader: {
    backgroundColor: '#f7fafc',
    fontFamily: 'Inter',
    color: '#2d3748'
  },
  tableCol: {
    width: '25%',
    paddingVertical: 5,
    paddingHorizontal: 8,
    fontFamily: 'Inter',
    fontSize: 10
  },
  text: {
    fontFamily: 'Inter',
    fontSize: 10,
    color: '#4a5568'
  },
  stats: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#f7fafc',
    borderRadius: 5
  }
});

const ResultsPDF: React.FC<ResultsPDFProps> = ({ players, teams }) => {
  const soldPlayers = players.filter((p: Player) => p.status === 'sold');
  const unsoldPlayers = players.filter((p: Player) => p.status === 'unsold');
  const totalSpent = soldPlayers.reduce((sum: number, p: Player) => sum + (p.soldAmount || 0), 0);
  const averagePrice = soldPlayers.length 
    ? totalSpent / soldPlayers.length 
    : 0;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.section}>
          <Text style={styles.header}>Auction Results Report</Text>
          <Text style={styles.text}>Generated on: {new Date().toLocaleDateString()}</Text>
        </View>

        {/* Summary Statistics */}
        <View style={styles.stats}>
          <Text style={styles.subHeader}>Auction Summary</Text>
          <Text style={styles.text}>Total Teams: {teams?.length || 0}</Text>
          <Text style={styles.text}>Total Players: {players?.length || 0}</Text>
          <Text style={styles.text}>Players Sold: {soldPlayers?.length || 0}</Text>
          <Text style={styles.text}>Players Unsold: {unsoldPlayers?.length || 0}</Text>
          <Text style={styles.text}>Total Amount Spent: ₹{totalSpent}</Text>
          <Text style={styles.text}>Average Player Price: ₹{averagePrice.toFixed(2)}</Text>
        </View>

        {/* Teams Table */}
        <View style={styles.section}>
          <Text style={styles.subHeader}>Team Summary</Text>
          <View style={styles.table}>
            <View style={[styles.tableRow, styles.tableHeader]}>
              <View style={styles.tableCol}>
                <Text style={styles.text}>Team Name</Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.text}>Players</Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.text}>Spent</Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.text}>Remaining</Text>
              </View>
            </View>
            {teams.map((team, i) => (
              <View key={i} style={styles.tableRow}>
                <View style={styles.tableCol}>
                  <Text style={styles.text}>{team?.name || ''}</Text>
                </View>
                <View style={styles.tableCol}>
                  <Text style={styles.text}>{team?.players?.length || 0}</Text>
                </View>
                <View style={styles.tableCol}>
                  <Text style={styles.text}>
                    ₹{team?.players?.reduce((sum: number, p: Player) => sum + (p.soldAmount || 0), 0) || 0}
                  </Text>
                </View>
                <View style={styles.tableCol}>
                  <Text style={styles.text}>₹{team?.budget || 0}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Players Table */}
        <View style={styles.section}>
          <Text style={styles.subHeader}>Sold Players</Text>
          <View style={styles.table}>
            <View style={[styles.tableRow, styles.tableHeader]}>
              <View style={styles.tableCol}>
                <Text style={styles.text}>Name</Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.text}>Team</Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.text}>Base Price</Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.text}>Sold Price</Text>
              </View>
            </View>
            {soldPlayers.map((player, i) => (
              <View key={i} style={styles.tableRow}>
                <View style={styles.tableCol}>
                  <Text style={styles.text}>{player?.name || ''}</Text>
                </View>
                <View style={styles.tableCol}>
                  <Text style={styles.text}>
                    {teams?.find(t => t._id === player?.team)?.name || ''}
                  </Text>
                </View>
                <View style={styles.tableCol}>
                  <Text style={styles.text}>{player?.regNo || ''}</Text>
                </View>
                <View style={styles.tableCol}>
                  <Text style={styles.text}>₹{player?.soldAmount || 0}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </Page>
    </Document>
  );
};

export default ResultsPDF;