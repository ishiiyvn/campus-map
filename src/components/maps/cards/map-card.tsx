import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ExternalLink } from 'lucide-react';
import EditMapButton from '@/components/maps/edit-map-button';
import { type Map } from '@/server/db/schema';

interface MapCardProps {
  map: Map;
}

export function MapCard({ map }: MapCardProps) {
  return (
    <Card className="flex flex-col overflow-hidden transition-all hover:shadow-md">
      <div className="relative aspect-video w-full overflow-hidden bg-muted">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img 
          src={map.map_image_url} 
          alt={map.name}
          className="object-cover w-full h-full transition-transform hover:scale-105"
        />
        <Badge variant={map.is_active ? "default" : "secondary"} className="absolute top-2 right-2">
          {map.is_active ? "Activo" : "Borrador"}
        </Badge>
      </div>
      
      <CardHeader>
        <CardTitle className="line-clamp-1">{map.name}</CardTitle>
        <CardDescription className="line-clamp-2">{map.description}</CardDescription>
      </CardHeader>
      
      <CardContent className="flex-1">
        <p className="text-xs text-muted-foreground font-mono bg-muted p-1 rounded px-2 w-fit">
          /{map.slug}
        </p>
      </CardContent>

      <CardFooter className="flex gap-2 pt-0">
        <Button asChild variant="outline" size="sm" className="flex-1">
          <Link href={`/maps/${map.slug}`} target="_blank">
            <ExternalLink className="w-4 h-4 mr-2" />
            Ver Público
          </Link>
        </Button>
        
        <EditMapButton map={map} />
      </CardFooter>
    </Card>
  );
}
