import { useState, useEffect } from 'react';
import { Ticket, Trophy, Calendar, Coins, Target, Clock } from 'lucide-react';
import { useProfile } from '@/react-app/hooks/useAPI';

interface LotteryPool {
  pool_type: string;
  current_amount: number;
  carryover_amount: number;
  next_draw_date: string;
}

interface LotteryTicket {
  id: number;
  numbers: string;
  cost: number;
  status: string;
  purchase_date: string;
  draw_type: string;
  payout: number;
  matches: number;
}

interface LotteryDraw {
  id: number;
  draw_type: string;
  draw_date: string;
  winning_numbers: string;
  total_pool: number;
  total_tickets: number;
  winners_count: number;
  payout_per_winner: number;
}

export default function LotterySystem() {
  const { profile, fetchProfile } = useProfile();
  const [pools, setPools] = useState<LotteryPool[]>([]);
  const [tickets, setTickets] = useState<LotteryTicket[]>([]);
  const [recentDraws, setRecentDraws] = useState<LotteryDraw[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'weekly' | 'monthly'>('weekly');
  
  // Weekly numbers (3 numbers, 1-30)
  const [weeklyNumbers, setWeeklyNumbers] = useState<number[]>([]);
  // Monthly numbers (5 numbers, 1-50)
  const [monthlyNumbers, setMonthlyNumbers] = useState<number[]>([]);

  useEffect(() => {
    fetchLotteryData();
  }, []);

  const fetchLotteryData = async () => {
    try {
      setLoading(true);
      
      // Fetch pools
      const poolsResponse = await fetch('/api/lottery/pools');
      if (poolsResponse.ok) {
        const poolsData = await poolsResponse.json();
        setPools(poolsData);
      }

      // Fetch user tickets
      const ticketsResponse = await fetch('/api/lottery/tickets');
      if (ticketsResponse.ok) {
        const ticketsData = await ticketsResponse.json();
        setTickets(ticketsData);
      }

      // Fetch recent draws
      const drawsResponse = await fetch('/api/lottery/draws/recent');
      if (drawsResponse.ok) {
        const drawsData = await drawsResponse.json();
        setRecentDraws(drawsData);
      }
    } catch (error) {
      console.error('Failed to fetch lottery data:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleNumber = (number: number, type: 'weekly' | 'monthly') => {
    if (type === 'weekly') {
      if (weeklyNumbers.includes(number)) {
        setWeeklyNumbers(weeklyNumbers.filter(n => n !== number));
      } else if (weeklyNumbers.length < 3) {
        setWeeklyNumbers([...weeklyNumbers, number].sort((a, b) => a - b));
      }
    } else {
      if (monthlyNumbers.includes(number)) {
        setMonthlyNumbers(monthlyNumbers.filter(n => n !== number));
      } else if (monthlyNumbers.length < 5) {
        setMonthlyNumbers([...monthlyNumbers, number].sort((a, b) => a - b));
      }
    }
  };

  const purchaseTicket = async (type: 'weekly' | 'monthly') => {
    const numbers = type === 'weekly' ? weeklyNumbers : monthlyNumbers;
    const requiredLength = type === 'weekly' ? 3 : 5;
    const cost = type === 'weekly' ? 5 : 10; // 5 LC for weekly, 10 LC for monthly

    if (numbers.length !== requiredLength) {
      alert(`Please select exactly ${requiredLength} numbers`);
      return;
    }

    if (!profile || profile.lc_coins < cost) {
      alert('Insufficient LC coins');
      return;
    }

    try {
      const response = await fetch('/api/lottery/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          draw_type: type,
          numbers: numbers.join(','),
          cost
        }),
      });

      if (response.ok) {
        // Clear selected numbers
        if (type === 'weekly') {
          setWeeklyNumbers([]);
        } else {
          setMonthlyNumbers([]);
        }
        
        // Refresh data
        await fetchLotteryData();
        await fetchProfile();
        
        alert('Ticket purchased successfully!');
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to purchase ticket');
      }
    } catch (error) {
      console.error('Purchase error:', error);
      alert('Failed to purchase ticket');
    }
  };

  const weeklyPool = pools.find(p => p.pool_type === 'weekly');
  const monthlyPool = pools.find(p => p.pool_type === 'monthly');

  const userWeeklyTickets = tickets.filter(t => t.draw_type === 'weekly');
  const userMonthlyTickets = tickets.filter(t => t.draw_type === 'monthly');

  if (loading) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-xl border border-purple-500/20 rounded-xl p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin">
            <Ticket className="w-6 h-6 text-purple-400" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Lottery Header */}
      <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-xl p-6">
        <h2 className="text-2xl font-bold text-white mb-2 flex items-center space-x-2">
          <Trophy className="w-6 h-6 text-yellow-400" />
          <span>CryptoMind Lottery</span>
        </h2>
        <p className="text-purple-200 text-sm">
          Win LC coins in our weekly and monthly lottery draws!
        </p>
      </div>

      {/* Tab Selector */}
      <div className="flex space-x-1 bg-slate-800/30 p-1 rounded-lg">
        <button
          onClick={() => setSelectedTab('weekly')}
          className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all ${
            selectedTab === 'weekly'
              ? 'bg-purple-600 text-white'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Weekly Draw
        </button>
        <button
          onClick={() => setSelectedTab('monthly')}
          className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all ${
            selectedTab === 'monthly'
              ? 'bg-pink-600 text-white'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Monthly Draw
        </button>
      </div>

      {/* Weekly Lottery */}
      {selectedTab === 'weekly' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Weekly Pool Info */}
          <div className="bg-slate-800/50 backdrop-blur-xl border border-purple-500/20 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-purple-400" />
              <span>Weekly Draw</span>
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Prize Pool:</span>
                <span className="text-2xl font-bold text-yellow-400 flex items-center space-x-1">
                  <Coins className="w-5 h-5" />
                  <span>{(weeklyPool?.current_amount || 0) + (weeklyPool?.carryover_amount || 0)}</span>
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Next Draw:</span>
                <span className="text-purple-300">
                  {weeklyPool?.next_draw_date ? new Date(weeklyPool.next_draw_date).toLocaleDateString() : 'TBD'}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Your Tickets:</span>
                <span className="text-blue-300">{userWeeklyTickets.length}</span>
              </div>
            </div>
          </div>

          {/* Weekly Number Selection */}
          <div className="bg-slate-800/50 backdrop-blur-xl border border-purple-500/20 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
              <Target className="w-5 h-5 text-purple-400" />
              <span>Pick 3 Numbers (1-30)</span>
            </h3>
            
            <div className="mb-4">
              <div className="text-sm text-gray-400 mb-2">
                Selected: {weeklyNumbers.join(', ') || 'None'}
              </div>
              <div className="grid grid-cols-6 gap-2">
                {Array.from({ length: 30 }, (_, i) => i + 1).map(number => (
                  <button
                    key={number}
                    onClick={() => toggleNumber(number, 'weekly')}
                    className={`w-10 h-10 rounded-lg text-sm font-medium transition-all ${
                      weeklyNumbers.includes(number)
                        ? 'bg-purple-600 text-white'
                        : 'bg-slate-700/50 text-gray-300 hover:bg-slate-600/50'
                    }`}
                  >
                    {number}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="flex items-center justify-between mb-4">
              <span className="text-gray-400">Cost: 5 LC coins</span>
              <span className="text-gray-400">Your LC: {profile?.lc_coins || 0}</span>
            </div>
            
            <button
              onClick={() => purchaseTicket('weekly')}
              disabled={weeklyNumbers.length !== 3 || !profile || profile.lc_coins < 5}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-all"
            >
              Purchase Weekly Ticket
            </button>
          </div>
        </div>
      )}

      {/* Monthly Lottery */}
      {selectedTab === 'monthly' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Pool Info */}
          <div className="bg-slate-800/50 backdrop-blur-xl border border-pink-500/20 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-pink-400" />
              <span>Monthly Draw</span>
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Prize Pool:</span>
                <span className="text-2xl font-bold text-yellow-400 flex items-center space-x-1">
                  <Coins className="w-5 h-5" />
                  <span>{(monthlyPool?.current_amount || 0) + (monthlyPool?.carryover_amount || 0)}</span>
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Next Draw:</span>
                <span className="text-pink-300">
                  {monthlyPool?.next_draw_date ? new Date(monthlyPool.next_draw_date).toLocaleDateString() : 'TBD'}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Your Tickets:</span>
                <span className="text-blue-300">{userMonthlyTickets.length}</span>
              </div>
            </div>
          </div>

          {/* Monthly Number Selection */}
          <div className="bg-slate-800/50 backdrop-blur-xl border border-pink-500/20 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
              <Target className="w-5 h-5 text-pink-400" />
              <span>Pick 5 Numbers (1-50)</span>
            </h3>
            
            <div className="mb-4">
              <div className="text-sm text-gray-400 mb-2">
                Selected: {monthlyNumbers.join(', ') || 'None'}
              </div>
              <div className="grid grid-cols-10 gap-1">
                {Array.from({ length: 50 }, (_, i) => i + 1).map(number => (
                  <button
                    key={number}
                    onClick={() => toggleNumber(number, 'monthly')}
                    className={`w-8 h-8 rounded text-xs font-medium transition-all ${
                      monthlyNumbers.includes(number)
                        ? 'bg-pink-600 text-white'
                        : 'bg-slate-700/50 text-gray-300 hover:bg-slate-600/50'
                    }`}
                  >
                    {number}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="flex items-center justify-between mb-4">
              <span className="text-gray-400">Cost: 10 LC coins</span>
              <span className="text-gray-400">Your LC: {profile?.lc_coins || 0}</span>
            </div>
            
            <button
              onClick={() => purchaseTicket('monthly')}
              disabled={monthlyNumbers.length !== 5 || !profile || profile.lc_coins < 10}
              className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-all"
            >
              Purchase Monthly Ticket
            </button>
          </div>
        </div>
      )}

      {/* Recent Draws */}
      <div className="bg-slate-800/50 backdrop-blur-xl border border-purple-500/20 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
          <Clock className="w-5 h-5 text-purple-400" />
          <span>Previous Draw Results</span>
        </h3>
        
        {recentDraws.length > 0 ? (
          <div className="space-y-3">
            {recentDraws.map((draw) => (
              <div key={draw.id} className="bg-slate-700/30 border border-gray-600/20 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className={`text-sm font-medium ${draw.draw_type === 'weekly' ? 'text-purple-300' : 'text-pink-300'}`}>
                      {draw.draw_type === 'weekly' ? 'Weekly' : 'Monthly'} Draw #{draw.id}
                    </span>
                    {draw.winners_count === 0 && (
                      <span className="bg-orange-500/20 text-orange-300 px-2 py-1 rounded text-xs">
                        No Winners - Jackpot Carried Over
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-gray-400">
                    {new Date(draw.draw_date).toLocaleDateString()}
                  </span>
                </div>
                
                <div className="space-y-2">
                  <div className="bg-slate-800/50 rounded-lg p-3">
                    <div className="text-white font-mono text-lg text-center">
                      🎯 Winning Numbers: <span className="text-yellow-400">{draw.winning_numbers}</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                    <div className="text-center">
                      <div className="text-gray-400">Total Pool</div>
                      <div className="text-yellow-400 font-bold">{draw.total_pool} LC</div>
                    </div>
                    <div className="text-center">
                      <div className="text-gray-400">Tickets Sold</div>
                      <div className="text-blue-400 font-bold">{draw.total_tickets}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-gray-400">Winners</div>
                      <div className={`font-bold ${draw.winners_count > 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {draw.winners_count}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-gray-400">Prize Each</div>
                      <div className="text-purple-400 font-bold">
                        {draw.payout_per_winner > 0 ? `${draw.payout_per_winner.toFixed(2)} LC` : '0 LC'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-400 py-8">
            <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No lottery draws completed yet.</p>
            <p className="text-xs mt-1">The first draw will appear here after completion.</p>
          </div>
        )}
      </div>

      {/* My Tickets */}
      {tickets.length > 0 && (
        <div className="bg-slate-800/50 backdrop-blur-xl border border-purple-500/20 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
            <Ticket className="w-5 h-5 text-purple-400" />
            <span>My Tickets</span>
          </h3>
          
          <div className="space-y-3">
            {tickets.slice(0, 10).map((ticket) => (
              <div key={ticket.id} className="bg-slate-700/30 border border-gray-600/20 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-white font-mono text-sm">
                      {ticket.numbers}
                    </div>
                    <div className="text-xs text-gray-400">
                      {ticket.draw_type} • {new Date(ticket.purchase_date).toLocaleDateString()}
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className={`text-sm font-medium ${
                      ticket.status === 'win' ? 'text-green-400' :
                      ticket.status === 'partial_win' || ticket.status === 'refund' ? 'text-yellow-400' :
                      ticket.status === 'lose' ? 'text-red-400' : 'text-gray-400'
                    }`}>
                      {ticket.status === 'pending' ? 'Pending' :
                       ticket.status === 'win' ? `Won ${ticket.payout} LC` :
                       ticket.status === 'partial_win' ? `Won ${ticket.payout} LC` :
                       ticket.status === 'refund' ? `Refund ${ticket.payout} LC` :
                       'No Win'}
                    </div>
                    <div className="text-xs text-gray-500">
                      Cost: {ticket.cost} LC
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
