/**
 * Modèles de données pour le système de narration
 * Inspiré de Final Fantasy Tactics
 */

export interface DialogNode {
  id: string;
  speaker: string;
  text: string;
  portrait?: string;
  position?: 'left' | 'right' | 'center';
  nextNodeId?: string;
  choices?: DialogChoice[];
  onComplete?: () => void;
}

export interface DialogChoice {
  id: string;
  text: string;
  nextNodeId: string;
  condition?: () => boolean;
}

export interface Story {
  id: string;
  title: string;
  description: string;
  nodes: DialogNode[];
  initialNodeId: string;
  onComplete?: () => void;
  context?: StoryContext;
}

export interface StoryContext {
  questId?: string;
  characterName?: string;
  characterClass?: string;
  location?: string;
  objectives?: string[];
  [key: string]: any;
}

export interface StoryProgress {
  storyId: string;
  currentNodeId: string;
  completedNodeIds: string[];
  choices: Record<string, string>;
  timestamp: number;
}

/**
 * Création d'une story pour la première quête
 */
export function createFirstQuestStory(characterName: string, characterClass: string): Story {
  return {
    id: 'quest_001_intro',
    title: 'Les Pillards Gobelins',
    description: 'Votre première mission en tant qu\'aventurier',
    initialNodeId: 'node_001',
    context: {
      questId: 'quest_001',
      characterName,
      characterClass,
      location: 'Royaume d\'Aether',
      objectives: ['Vaincre tous les ennemis', 'Protéger les fermes']
    },
    nodes: [
      {
        id: 'node_001',
        speaker: 'Narrateur',
        text: `Bienvenue dans le royaume d'Aether, ${characterName}.`,
        position: 'center',
        nextNodeId: 'node_002'
      },
      {
        id: 'node_002',
        speaker: 'Narrateur',
        text: `En tant que ${characterClass}, vous avez été recruté pour protéger les terres du royaume.`,
        position: 'center',
        nextNodeId: 'node_003'
      },
      {
        id: 'node_003',
        speaker: 'Chef du village',
        text: 'Des gobelins pillent nos fermes depuis plusieurs jours ! Nous avons besoin d\'aide !',
        portrait: 'village_chief',
        position: 'left',
        nextNodeId: 'node_004'
      },
      {
        id: 'node_004',
        speaker: characterName,
        text: 'Ne vous inquiétez pas, je vais m\'occuper de ces pillards.',
        portrait: 'player',
        position: 'right',
        nextNodeId: 'node_005'
      },
      {
        id: 'node_005',
        speaker: 'Chef du village',
        text: 'Merci ! Je vous envoie un de mes meilleurs hommes pour vous aider.',
        portrait: 'village_chief',
        position: 'left',
        nextNodeId: 'node_006'
      },
      {
        id: 'node_006',
        speaker: 'Narrateur',
        text: 'Préparez-vous au combat. Les gobelins ne se rendront pas sans se battre.',
        position: 'center',
        nextNodeId: undefined
      }
    ]
  };
}

/**
 * Création d'une story de victoire
 */
export function createVictoryStory(characterName: string, goldEarned: number, xpEarned: number): Story {
  return {
    id: 'quest_001_victory',
    title: 'Victoire !',
    description: 'Vous avez vaincu les pillards',
    initialNodeId: 'victory_001',
    context: {
      questId: 'quest_001',
      characterName,
      goldEarned,
      xpEarned
    },
    nodes: [
      {
        id: 'victory_001',
        speaker: 'Narrateur',
        text: 'Les gobelins ont été vaincus ! Les fermes sont sauvées.',
        position: 'center',
        nextNodeId: 'victory_002'
      },
      {
        id: 'victory_002',
        speaker: 'Chef du village',
        text: `${characterName}, vous avez sauvé notre village ! Acceptez cette récompense.`,
        portrait: 'village_chief',
        position: 'left',
        nextNodeId: 'victory_003'
      },
      {
        id: 'victory_003',
        speaker: 'Narrateur',
        text: `Vous avez gagné ${xpEarned} XP et ${goldEarned} pièces d'or !`,
        position: 'center',
        nextNodeId: undefined
      }
    ]
  };
}

/**
 * Factory pour créer un nœud de dialogue
 */
export function createDialogNode(params: Partial<DialogNode>): DialogNode {
  return {
    id: params.id || crypto.randomUUID(),
    speaker: params.speaker || 'Narrateur',
    text: params.text || '',
    portrait: params.portrait,
    position: params.position || 'center',
    nextNodeId: params.nextNodeId,
    choices: params.choices,
    onComplete: params.onComplete
  };
}

/**
 * Vérifier si une story est terminée
 */
export function isStoryComplete(story: Story, currentNodeId: string): boolean {
  const currentNode = story.nodes.find(n => n.id === currentNodeId);
  return currentNode ? !currentNode.nextNodeId && !currentNode.choices : false;
}

/**
 * Obtenir le prochain nœud
 */
export function getNextNode(story: Story, currentNodeId: string, choiceId?: string): DialogNode | null {
  const currentNode = story.nodes.find(n => n.id === currentNodeId);
  
  if (!currentNode) return null;
  
  // Si un choix est fait
  if (choiceId && currentNode.choices) {
    const choice = currentNode.choices.find(c => c.id === choiceId);
    if (choice) {
      return story.nodes.find(n => n.id === choice.nextNodeId) || null;
    }
  }
  
  // Sinon, suivre le flux normal
  if (currentNode.nextNodeId) {
    return story.nodes.find(n => n.id === currentNode.nextNodeId) || null;
  }
  
  return null;
}
