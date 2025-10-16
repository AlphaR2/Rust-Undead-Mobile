import { CheckpointContent } from '@/components/GameCard/CheckpointModal'

// Define checkpoint content for each chapter
export type PathContent = {
  checkpoints: CheckpointContent[]
  id: number
}[]
export const PATH_CONTENTS: PathContent = [
  {
    id: 1,
    checkpoints: [
      {
        topic_id: 1,
        title: 'CPU Basics and Architecture',

        learning_content: {
          summary:
            'Learn how CPUs execute instructions and manage data through registers, cache, and memory hierarchies.',
          big_note: [
            'Think of the CPU as the brain of your computer. It has three main jobs: fetch instructions from memory, decode what those instructions mean, and execute them. This happens billions of times per second!',
            "The CPU uses a memory hierarchy for speed: tiny but super-fast, also registers → small but fast, cache → large but slower, then RAM → huge but slowest storage. It's like having your most-used tools on your desk (registers), frequently-used items in desk drawers (cache), and everything else in filing cabinets (RAM) or storage rooms (disk).",
            'Modern CPUs are like having multiple brains working together - they can process many instructions at once',
          ],
          battle_relevance:
            'Understanding CPU architecture helps you grasp why certain program operations cost more compute units than others.',
        },
        questions: [
          {
            question_id: 1,
            text: "The CPU's fetch-decode-execute cycle is fundamental to how programs run on computers.",
            correct: true,
            explanation:
              'Every instruction a program executes goes through this cycle: fetch from memory, decode the instruction, execute the operation.',
          },
          {
            question_id: 2,
            text: 'Cache memory is slower than RAM but stores more data for long-term use.',
            correct: false,
            explanation:
              'Cache is actually much faster than RAM but stores less data. It acts as a high-speed buffer between CPU and RAM.',
          },
        ],
      },
      {
        topic_id: 2,
        title: 'Operating System Kernel',

        learning_content: {
          summary:
            'The kernel is the core of the operating system that manages hardware resources and provides services to applications.',
          big_note: [
            'The kernel is like the manager of a busy restaurant. It decides which programs get to use the CPU (like assigning chefs to orders), manages memory (like organizing ingredients and workspace), and handles communication between programs and hardware (like coordinating between kitchen and dining room).',
            "There are two privilege levels: kernel mode (full access to everything) and user mode (restricted access). It's like the difference between being the restaurant manager who can access everything, versus being a customer who can only interact through waiters (system calls).",
            "The kernel also manages processes - when you open multiple apps, the kernel rapidly switches between them so fast it seems like they're all running at once. This is called multitasking.",
          ],
          battle_relevance:
            'Understanding process management helps explain how blockchain nodes run multiple concurrent operations and manage system resources.',
        },
        questions: [
          {
            question_id: 3,
            text: 'The kernel operates in a privileged mode that allows direct hardware access.',
            correct: true,
            explanation:
              'The kernel runs in kernel mode (ring 0) with full hardware access, while user applications run in user mode (ring 3) with restricted access.',
          },
          {
            question_id: 4,
            text: 'System calls allow user programs to directly manipulate hardware without kernel involvement.',
            correct: false,
            explanation:
              "System calls are the interface that allows user programs to request kernel services - they don't bypass the kernel but go through it.",
          },
        ],
      },
      {
        topic_id: 3,
        title: 'Binary and Data Representation',

        learning_content: {
          summary:
            'Computers store and process all information as binary digits (bits). Understanding how data is encoded is fundamental to computer science.',
          big_note: [
            "At the deepest level, computers only understand two things: ON (1) and OFF (0). Everything - numbers, text, images, videos - gets converted to combinations of 1s and 0s called binary. It's like Morse code but with only two symbols.",
            "We often use hexadecimal (base-16) as a shorthand for binary because it's easier to read. Each hex digit represents exactly 4 binary digits. So 'F' in hex equals '1111' in binary, and 'FF' equals '11111111' (which is 255 in decimal).",
            'A byte is always 8 bits, and can represent 256 different values (0-255). Text characters, colors in images, and even blockchain addresses are all just different ways of interpreting these byte patterns.',
          ],
          battle_relevance:
            "Understanding binary and hex helps you read blockchain explorers and understand why addresses look like '5AUHCWm4TzipCWK9H3EKx9JNccEA3rfNSUp4BCy2Zy2f'.",
        },
        questions: [
          {
            question_id: 5,
            text: 'The hexadecimal number 0xFF represents the decimal value 255.',
            correct: true,
            explanation:
              '0xFF = 15×16¹ + 15×16⁰ = 240 + 15 = 255. This is the maximum value for an 8-bit unsigned integer.',
          },
          {
            question_id: 6,
            text: 'One byte always contains exactly 8 bits regardless of the computer architecture.',
            correct: true,
            explanation:
              'By definition, a byte is 8 bits. This standardization allows consistent data representation across different systems and is fundamental to how computers process data.',
          },
        ],
      },
      {
        topic_id: 4,
        title: 'Programs and Memory Management',

        learning_content: {
          summary: 'Understanding how programs are executed and how they use memory during operation.',
          big_note: [
            "Programs start as human-readable code, but computers can't understand it directly. The code must be either compiled (translated all at once into machine code) or interpreted (translated line-by-line as it runs). Think of it like translating a book all at once vs. translating it as someone reads it aloud.",
            'When programs run, they use two main memory areas: the stack (for temporary, short-term data like function calls) and the heap (for long-term data that can grow and shrink). The stack is like your desk workspace - organized and temporary. The heap is like a storage warehouse - flexible but needs management.',
            "Memory leaks happen when programs allocate heap memory but forget to free it up when done. It's like renting storage units but never returning the keys - eventually you run out of available units.",
          ],
          battle_relevance:
            'Understanding memory management explains why blockchain operations have compute limits and why some programs are more efficient than others.',
        },
        questions: [
          {
            question_id: 7,
            text: 'Compiled programs generally execute faster than interpreted programs.',
            correct: true,
            explanation:
              'Compiled programs are pre-translated to machine code, while interpreted programs are translated line-by-line during execution.',
          },
          {
            question_id: 8,
            text: 'The stack is used for dynamic memory allocation that can grow during program execution.',
            correct: false,
            explanation:
              'The stack is for static, temporary data (local variables, function calls). The heap is used for dynamic memory allocation.',
          },
        ],
      },
      {
        topic_id: 5,
        title: 'File Systems and Data Storage',

        learning_content: {
          summary: 'How computers organize, store, and retrieve data on persistent storage devices.',
          big_note: [
            'File systems are like the organization system for a massive library. Files are the books, directories are the sections/shelves, and the file system keeps track of where everything is stored and who can access what. Each file has metadata (like a library card) that includes size, creation date, and permissions.',
            'Storage devices have different trade-offs: HDDs are like warehouses (lots of space, slower access), SSDs are like organized stockrooms (less space, much faster access), and RAM is like your desktop (very little space, instant access but loses everything when power goes off).',
            "Databases add another layer - they're like having a smart librarian who can quickly find exactly what you need using indexes and can handle multiple people requesting books simultaneously without conflicts.",
          ],
          battle_relevance:
            'Understanding data storage explains why blockchain nodes need substantial disk space and how account data is organized on-chain.',
        },
        questions: [
          {
            question_id: 9,
            text: 'SSDs provide faster random access than HDDs but have unlimited write cycles.',
            correct: false,
            explanation:
              'While SSDs are faster than HDDs, they have limited write/erase cycles due to the nature of flash memory cells.',
          },
          {
            question_id: 10,
            text: 'ACID properties ensure database transactions are processed reliably even during system failures.',
            correct: true,
            explanation:
              'Atomicity, Consistency, Isolation, and Durability guarantee that database transactions are processed reliably.',
          },
        ],
      },
       {
        topic_id: 6,
        title: 'File Systems and Data Storage',

        learning_content: {
          summary: 'How computers organize, store, and retrieve data on persistent storage devices.',
          big_note: [
            'File systems are like the organization system for a massive library. Files are the books, directories are the sections/shelves, and the file system keeps track of where everything is stored and who can access what. Each file has metadata (like a library card) that includes size, creation date, and permissions.',
            'Storage devices have different trade-offs: HDDs are like warehouses (lots of space, slower access), SSDs are like organized stockrooms (less space, much faster access), and RAM is like your desktop (very little space, instant access but loses everything when power goes off).',
            "Databases add another layer - they're like having a smart librarian who can quickly find exactly what you need using indexes and can handle multiple people requesting books simultaneously without conflicts.",
          ],
          battle_relevance:
            'Understanding data storage explains why blockchain nodes need substantial disk space and how account data is organized on-chain.',
        },
        questions: [
          {
            question_id: 9,
            text: 'SSDs provide faster random access than HDDs but have unlimited write cycles.',
            correct: false,
            explanation:
              'While SSDs are faster than HDDs, they have limited write/erase cycles due to the nature of flash memory cells.',
          },
          {
            question_id: 10,
            text: 'ACID properties ensure database transactions are processed reliably even during system failures.',
            correct: true,
            explanation:
              'Atomicity, Consistency, Isolation, and Durability guarantee that database transactions are processed reliably.',
          },
        ],
      },
    ],
  },
]
// Helper to get checkpoint positions evenly spaced across world width
export const getCheckpointPositions = (
  worldWidth: number,
  screenHeight: number,
  numCheckpoints: number = 6,
): Array<{ x: number; y: number }> => {
  const positions: Array<{ x: number; y: number }> = []
  const spacing = worldWidth / (numCheckpoints + 1)

  // Position checkpoints on the ground
  // Ground is at screenHeight + 32, checkpoint should sit on top
  const groundY = screenHeight + 32
  const checkpointHeight = 60 // Default checkpoint size
  const checkpointY = groundY - 50 - checkpointHeight / 2 - 30 // 50 = half ground height, 30 = padding above ground

  for (let i = 1; i <= numCheckpoints; i++) {
    positions.push({
      x: spacing * i,
      y: checkpointY,
    })
  }

  return positions
}
