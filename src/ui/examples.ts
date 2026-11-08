export interface Example {
  title: string;
  source: string;
}

export const EXAMPLES: Example[] = [
  {
    title: 'Problem statement',
    source: 'board Rajiv Chowk; ride Yellow to Hauz Khas; change Magenta; ride to Botanical Garden; exit\n',
  },
  {
    title: 'Old Delhi to the airport',
    source: '# Chandni Chowk to Terminal 3\nboard Chandni Chowk\nride Yellow to New Delhi\nchange Airport Express\nride to IGI Airport\nexit\n',
  },
  {
    title: 'Three lines via Mandi House',
    source: 'board Kashmere Gate;\nride Violet to Mandi House;\nchange Blue;\nride to Rajiv Chowk;\nchange Yellow;\nride to Hauz Khas;\nexit\n',
  },
  {
    title: 'Branch line (Blue → Vaishali)',
    source: '# Vaishali is on a branch: change trains at Yamuna Bank\nboard Vaishali\nride Blue to Yamuna Bank\nride Blue to Noida City Centre\nexit\n',
  },
  {
    title: 'Error: station not on line',
    source: 'board Rajiv Chowk; ride Yellow to Botanical Garden; exit\n',
  },
  {
    title: 'Error: not an interchange',
    source: 'board Rajiv Chowk;\nride Yellow to Patel Chowk;\nchange Violet;\nride to Lajpat Nagar;\nexit\n',
  },
  {
    title: 'Error: typos',
    source: 'board Rajiv Chok; ride Yelow to Hauz Kas; change Magneta; ride to Botanical Gardens; exit\n',
  },
  {
    title: 'Error: syntax',
    source: 'board Hauz Khas ride Magenta to Kalkaji Mandir\ngo Violet to Nehru Place\n',
  },
];
