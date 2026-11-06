import {it,expect} from 'vitest';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {createGame} from '../game';
import {content} from '../neighbourhood/registry';
import WorldViewport from './WorldViewport';
import {createWorld} from './state';
import {worldMaps} from './registry';
function dialogueMarkup(recovered:boolean,fresh=false){
 const game=createGame(content,42),word=content.characters[0].greeting.tokens[0];game.journal={[word.id]:{lookups:1,lastSeen:100,recovered}};
 const html=renderToStaticMarkup(createElement(WorldViewport,{state:createWorld(worldMaps),maps:worldMaps,game,dialogue:{...content.characters[0].greeting,tokens:[word]},fresh:fresh?[word.id]:[],onLookup:()=>{},onAction:()=>{}}));
 return html.slice(html.indexOf('class="world-life-dialogue"'),html.indexOf('class="world-pad"'));
}
it('keeps a lookup-only word fogged in ambient world speech',()=>{expect(dialogueMarkup(false)).toContain('class="word fogged"');expect(dialogueMarkup(false)).toContain('data-recovered="false"');});
it('shows recovered speech plainly and preserves its fresh-word marker',()=>{expect(dialogueMarkup(true)).toContain('data-recovered="true"');expect(dialogueMarkup(true,true)).toContain('class="word new-word"');});
